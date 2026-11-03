package com.newtech.tvrecovery;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(UsbSerialPlugin.class);
        registerPlugin(IrRemotePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
