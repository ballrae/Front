package com.ballrae;

import android.content.Context;
import android.content.SharedPreferences;

public class WidgetStorage {
    private static final String PREFS_NAME = "BallraeWidgetPrefs";
    private static final String KEY_MESSAGE = "widget_message";

    public static void saveMessage(Context context, String message) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_MESSAGE, message).apply();
    }

    public static String getMessage(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        return prefs.getString(KEY_MESSAGE, "🔥 Ballrae 위젯");

    }
}