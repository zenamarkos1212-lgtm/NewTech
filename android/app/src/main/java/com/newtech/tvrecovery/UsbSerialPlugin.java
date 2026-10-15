package com.newtech.tvrecovery;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.hoho.android.usbserial.driver.UsbSerialDriver;
import com.hoho.android.usbserial.driver.UsbSerialPort;
import com.hoho.android.usbserial.driver.UsbSerialProber;
import com.hoho.android.usbserial.util.SerialInputOutputManager;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "UsbSerial")
public class UsbSerialPlugin extends Plugin {

    private static final String ACTION_USB_PERMISSION =
            "com.newtech.tvrecovery.USB_PERMISSION";

    private UsbManager usbManager;
    private UsbSerialPort serialPort;
    private UsbDeviceConnection connection;
    private SerialInputOutputManager ioManager;
    private ExecutorService executor;

    private PluginCall pendingCall;
    private UsbSerialDriver pendingDriver;
    private BroadcastReceiver permissionReceiver;
    private boolean receiverRegistered = false;

    @PluginMethod
    public void connect(PluginCall call) {
        if (serialPort != null) {
            JSObject result = new JSObject();
            result.put("connected", true);
            result.put("deviceName", "USB Serial");
            call.resolve(result);
            return;
        }

        int baudRate = call.getInt("baudRate", 115200);

        usbManager = (UsbManager) getContext()
                .getSystemService(Context.USB_SERVICE);

        if (usbManager == null) {
            call.reject("Android USB service is unavailable.");
            return;
        }

        List<UsbSerialDriver> drivers =
                UsbSerialProber.getDefaultProber()
                        .findAllDrivers(usbManager);

        if (drivers.isEmpty()) {
            call.reject(
                    "No supported USB serial device found. " +
                    "Check the OTG adapter, PL2303 cable and USB connection."
            );
            return;
        }

        UsbSerialDriver driver = drivers.get(0);
        UsbDevice device = driver.getDevice();

        if (usbManager.hasPermission(device)) {
            openSerialPort(driver, baudRate, call);
            return;
        }

        pendingCall = call;
        pendingDriver = driver;

        registerPermissionReceiver();

        Intent intent = new Intent(ACTION_USB_PERMISSION);
        intent.setPackage(getContext().getPackageName());

        PendingIntent permissionIntent = PendingIntent.getBroadcast(
                getContext(),
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT |
                        PendingIntent.FLAG_MUTABLE
        );

        usbManager.requestPermission(device, permissionIntent);
    }

    private void registerPermissionReceiver() {
        if (receiverRegistered) {
            return;
        }

        permissionReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (!ACTION_USB_PERMISSION.equals(intent.getAction())) {
                    return;
                }

                PluginCall call = pendingCall;
                UsbSerialDriver driver = pendingDriver;

                pendingCall = null;
                pendingDriver = null;

                unregisterPermissionReceiver();

                if (call == null || driver == null) {
                    return;
                }

                boolean granted = intent.getBooleanExtra(
                        UsbManager.EXTRA_PERMISSION_GRANTED,
                        false
                );

                if (!granted) {
                    call.reject("USB permission was denied.");
                    return;
                }

                openSerialPort(
                        driver,
                        call.getInt("baudRate", 115200),
                        call
                );
            }
        };

        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);

        ContextCompat.registerReceiver(
                getContext(),
                permissionReceiver,
                filter,
                ContextCompat.RECEIVER_NOT_EXPORTED
        );

        receiverRegistered = true;
    }

    private void unregisterPermissionReceiver() {
        if (receiverRegistered && permissionReceiver != null) {
            try {
                getContext().unregisterReceiver(permissionReceiver);
            } catch (Exception ignored) {
            }

            receiverRegistered = false;
            permissionReceiver = null;
        }
    }

    private void openSerialPort(
            UsbSerialDriver driver,
            int baudRate,
            PluginCall call
    ) {
        try {
            connection = usbManager.openDevice(driver.getDevice());

            if (connection == null) {
                call.reject("Could not open USB device.");
                return;
            }

            serialPort = driver.getPorts().get(0);
            serialPort.open(connection);

            serialPort.setParameters(
                    baudRate,
                    8,
                    UsbSerialPort.STOPBITS_1,
                    UsbSerialPort.PARITY_NONE
            );

            ioManager = new SerialInputOutputManager(
                    serialPort,
                    new SerialInputOutputManager.Listener() {
                        @Override
                        public void onNewData(byte[] data) {
                            JSObject event = new JSObject();
                            event.put(
                                    "data",
                                    new String(data, StandardCharsets.UTF_8)
                            );
                            event.put("bytes", data.length);
                            notifyListeners("serialData", event);
                        }

                        @Override
                        public void onRunError(Exception e) {
                            JSObject event = new JSObject();
                            event.put(
                                    "message",
                                    e.getMessage() == null
                                            ? "Serial read error"
                                            : e.getMessage()
                            );
                            notifyListeners("serialError", event);
                        }
                    }
            );

            executor = Executors.newSingleThreadExecutor();
            executor.submit(ioManager);

            JSObject result = new JSObject();
            result.put("connected", true);
            result.put(
                    "deviceName",
                    driver.getClass().getSimpleName()
            );
            result.put("baudRate", baudRate);

            call.resolve(result);

        } catch (Exception e) {
            closePortInternal();

            call.reject(
                    "Unable to open USB serial port: " + e.getMessage(),
                    e
            );
        }
    }

    @PluginMethod
    public void write(PluginCall call) {
        if (serialPort == null) {
            call.reject("USB serial port is not connected.");
            return;
        }

        String data = call.getString("data");

        if (data == null) {
            call.reject("No serial data provided.");
            return;
        }

        try {
            byte[] bytes = data.getBytes(StandardCharsets.UTF_8);
            serialPort.write(bytes, 3000);
            call.resolve();
        } catch (Exception e) {
            call.reject("Serial write failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void toggleSignals(PluginCall call) {
        if (serialPort == null) {
            call.reject("USB serial port is not connected.");
            return;
        }

        try {
            serialPort.setDTR(call.getBoolean("dtr", false));
            serialPort.setRTS(call.getBoolean("rts", false));
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not change DTR/RTS signals: " +
                    e.getMessage(), e);
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        closePortInternal();
        call.resolve();
    }

    private synchronized void closePortInternal() {
        if (ioManager != null) {
            try {
                ioManager.stop();
            } catch (Exception ignored) {
            }
            ioManager = null;
        }

        if (executor != null) {
            executor.shutdownNow();
            executor = null;
        }

        if (serialPort != null) {
            try {
                serialPort.close();
            } catch (Exception ignored) {
            }
            serialPort = null;
        }

        if (connection != null) {
            try {
                connection.close();
            } catch (Exception ignored) {
            }
            connection = null;
        }
    }
}
