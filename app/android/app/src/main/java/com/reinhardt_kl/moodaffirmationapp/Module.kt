package expo.modules.widgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoWidgetsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoWidgets")

    Function("setWidgetData") { json: String, packageName: String ->
      context.getSharedPreferences("$packageName.widgetdata", Context.MODE_PRIVATE)
        .edit()
        .putString("widgetdata", json)
        .commit()

      val widgetManager = AppWidgetManager.getInstance(context)
      val providers = context.packageManager.queryBroadcastReceivers(
        Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE).setPackage(packageName),
        PackageManager.GET_META_DATA
      )

      // Implicit broadcasts don't reach manifest receivers on Android 8+, so target each provider explicitly.
      for (provider in providers) {
        val component = ComponentName(provider.activityInfo.packageName, provider.activityInfo.name)
        val ids = widgetManager.getAppWidgetIds(component)
        if (ids.isEmpty()) continue
        val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
          .setComponent(component)
          .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        context.sendBroadcast(intent)
      }
    }
  }

  private val context
    get() = requireNotNull(appContext.reactContext)
}
