package com.kirix.moodly

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject

class DailyAffirmationWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    for (id in appWidgetIds) {
      render(context, appWidgetManager, id)
    }
  }

  companion object {
    private const val DEFAULT_TEXT = "I am worthy of all the good things coming my way."

    fun render(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
      val prefs = context.getSharedPreferences(context.packageName + ".widgetdata", Context.MODE_PRIVATE)
      var text = DEFAULT_TEXT
      var streak = 0
      prefs.getString("widgetdata", null)?.let {
        try {
          val json = JSONObject(it)
          text = json.optString("text", DEFAULT_TEXT).ifBlank { DEFAULT_TEXT }
          streak = json.optInt("streak", 0)
        } catch (_: Exception) {
        }
      }

      val views = RemoteViews(context.packageName, R.layout.daily_affirmation_widget)
      views.setTextViewText(R.id.widget_text, text)
      views.setTextViewText(
        R.id.widget_streak,
        if (streak > 0) "\uD83D\uDD25 $streak day streak" else "Start your streak today"
      )

      context.packageManager.getLaunchIntentForPackage(context.packageName)?.let { launch ->
        val pending = PendingIntent.getActivity(
          context,
          0,
          launch,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_root, pending)
      }

      appWidgetManager.updateAppWidget(appWidgetId, views)
    }
  }
}
