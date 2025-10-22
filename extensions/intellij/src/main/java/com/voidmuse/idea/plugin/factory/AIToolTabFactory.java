package com.voidmuse.idea.plugin.factory;

import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowFactory;
import com.intellij.ui.content.Content;
import com.intellij.ui.content.ContentFactory;
import com.intellij.ui.jcef.JBCefBrowser;
import com.intellij.ui.jcef.JBCefClient;
import com.voidmuse.idea.plugin.service.ProjectBeanService;
import com.voidmuse.idea.plugin.service.ProtocDispatchService;
import com.voidmuse.idea.plugin.util.StateUtils;
import org.cef.CefApp;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.browser.CefMessageRouter;
import org.cef.handler.CefLoadHandler;
import org.cef.network.CefRequest;
import org.jetbrains.annotations.NotNull;

import javax.swing.*;
import java.awt.*;

public class AIToolTabFactory implements ToolWindowFactory {

    private static final Logger LOG = Logger.getInstance(AIToolTabFactory.class);

    @Override
    public void createToolWindowContent(@NotNull Project project, @NotNull ToolWindow toolWindow) {
        JBCefBrowser browser = new JBCefBrowser();
        ProjectBeanService.getInstance(project).setBrowser(browser);

        JPanel panel = new JPanel(new BorderLayout());
        panel.add(browser.getComponent(), BorderLayout.CENTER);
        ContentFactory contentFactory = ContentFactory.getInstance();
        Content content = contentFactory.createContent(panel, "", false);
        content.setCloseable(false);
        toolWindow.getContentManager().addContent(content);

        JBCefClient jbCefClient = browser.getJBCefClient();

        CefMessageRouter.CefMessageRouterConfig routerConfig =
                new CefMessageRouter.CefMessageRouterConfig("callJava", "callJavaCancel");

        CefMessageRouter messageRouter = CefMessageRouter.create(routerConfig,
                ProtocDispatchService.getInstance(project));
        jbCefClient.getCefClient().addMessageRouter(messageRouter);

        // Check if development mode is enabled via environment variable or system property
        boolean isDevelopmentMode = "true".equals(System.getenv("VOIDMUSE_DEV_MODE")) 
                || "true".equals(System.getProperty("voidmuse.dev.mode"));
        
        String targetUrl;
        if (isDevelopmentMode) {
            // Development mode: use localhost server
            targetUrl = "http://localhost:3002/";
            LOG.info("VoidMuse running in development mode, using: " + targetUrl);
        } else {
            // Production mode: use static resources
            CefApp.getInstance()
                    .registerSchemeHandlerFactory("http", "voidmuse", new DataSchemeHandlerFactory());
            targetUrl = "http://voidmuse/index.html";
            LOG.info("VoidMuse running in production mode, using static resources");
        }

        //添加一个监听，页面加载完成后再注册一次事件，防止丢失
        jbCefClient.addLoadHandler(new CefLoadHandler() {
            @Override
            public void onLoadingStateChange(CefBrowser browser, boolean isLoading, boolean canGoBack, boolean canGoForward) {
                if (!isLoading) {
                    jbCefClient.getCefClient().addMessageRouter(messageRouter);
                }
            }

            @Override
            public void onLoadStart(CefBrowser browser, CefFrame frame, CefRequest.TransitionType transitionType) {
            }

            @Override
            public void onLoadEnd(CefBrowser browser, CefFrame frame, int httpStatusCode) {
            }

            @Override
            public void onLoadError(CefBrowser browser, CefFrame frame, ErrorCode errorCode, String errorText, String failedUrl) {
            }
        }, browser.getCefBrowser());

        browser.loadURL(targetUrl);
    }
}
