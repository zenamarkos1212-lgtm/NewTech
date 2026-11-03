package com.newtech.tvrecovery;

import android.content.Context;
import android.hardware.ConsumerIrManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

@CapacitorPlugin(name = "IrRemote")
public class IrRemotePlugin extends Plugin {

    private ConsumerIrManager getIrManager() {
        return (ConsumerIrManager) getContext()
            .getSystemService(Context.CONSUMER_IR_SERVICE);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        ConsumerIrManager ir = getIrManager();
        JSObject result = new JSObject();

        boolean available = ir != null && ir.hasIrEmitter();

        result.put("available", available);
        result.put(
            "message",
            available
                ? "IR emitter detected"
                : "No compatible IR emitter detected"
        );

        call.resolve(result);
    }

    @PluginMethod
    public void transmitPattern(PluginCall call) {
        ConsumerIrManager ir = getIrManager();

        if (ir == null || !ir.hasIrEmitter()) {
            call.reject("This device does not expose a compatible IR emitter.");
            return;
        }

        Integer frequency = call.getInt("frequency");
        JSArray patternArray = call.getArray("pattern");

        if (frequency == null || frequency < 20000 || frequency > 60000) {
            call.reject("IR frequency must be between 20000 and 60000 Hz.");
            return;
        }

        if (patternArray == null || patternArray.length() < 2) {
            call.reject("A valid IR timing pattern is required.");
            return;
        }

        if (patternArray.length() > 1000) {
            call.reject("IR pattern is too long.");
            return;
        }

        int[] pattern = new int[patternArray.length()];

        try {
            for (int i = 0; i < patternArray.length(); i++) {
                Integer duration = patternArray.getInt(i);

                if (duration == null || duration <= 0 || duration > 100000) {
                    call.reject("Invalid IR timing at position " + i);
                    return;
                }

                pattern[i] = duration;
            }

            ir.transmit(frequency, pattern);

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("frequency", frequency);
            result.put("timingCount", pattern.length);
            call.resolve(result);

        } catch (JSONException | RuntimeException e) {
            call.reject("IR transmission failed: " + e.getMessage(), e);
        }
    }
}
