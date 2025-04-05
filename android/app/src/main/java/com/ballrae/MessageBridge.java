package com.ballrae;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class MessageBridge extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public MessageBridge(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "MessageBridge";
    }

    @ReactMethod
    public void saveMessage(String message) {
        Log.d("BallraeBridge", "✅ 저장 요청됨: " + message);
        WidgetStorage.saveMessage(reactContext, message);

        // ✅ 여기 추가! → 위젯 수동 업데이트
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(reactContext);
        ComponentName thisWidget = new ComponentName(reactContext, WidgetProvider.class);
        int[] allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);

        Intent updateIntent = new Intent(reactContext, WidgetProvider.class);
        updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, allWidgetIds);
        reactContext.sendBroadcast(updateIntent);
    }
}