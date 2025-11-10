import { IDEService } from '@/api/IDEService';
import { errorReportingService } from '../ErrorReportingService';

/**
 * Web content extraction parameters
 */
export interface WebContentParams {
    url: string;
    maxLength?: number;
    retryAttempts?: number;
    timeout?: number;
}

/**
 * Web content extraction response
 */
export interface WebContentResponse {
    code: number;
    msg: string | null;
    data: {
        title: string | null;
        description: string;
        url: string;
        favicon: string;
        truncated: boolean;
        source: 'proxy'; // Actual content source used
    };
}

/**
 * Unified web content extraction utility class
 * Integrates multiple content acquisition methods and parsing logic
 */
export class WebContentExtractor {
    private static instance: WebContentExtractor;
    private ideService: IDEService;

    // Proxy service configuration
    private readonly proxyUrl = 'https://api.allorigins.win/get?url=';

    // Content selectors (sorted by priority)
    private readonly contentSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.content',
        '#content',
        '.article',
        '.post',
        '.entry-content'
    ];

    // Element selectors to be removed
    private readonly removeSelectors = [
        'script',
        'style',
        'nav',
        'header',
        'footer',
        'iframe',
        '[role="banner"]',
        '[role="navigation"]',
        '[role="complementary"]',
        '.sidebar',
        '.advertisement',
        '.ads',
        '.social-share'
    ];

    // Extended favicon selectors
    private readonly faviconSelectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]',
        'link[rel="mask-icon"]',
        'link[rel="fluid-icon"]',
        'link[href$=".ico"]',
        'link[href*="favicon"]'
    ];

    private constructor() {
        this.ideService = IDEService.getInstance();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): WebContentExtractor {
        if (!WebContentExtractor.instance) {
            WebContentExtractor.instance = new WebContentExtractor();
        }
        return WebContentExtractor.instance;
    }

    /**
     * Extract web content
     * @param params Extraction parameters
     * @returns Extraction result
     */
    public async extractWebContent(params: WebContentParams): Promise<WebContentResponse> {
        const maxLength = params.maxLength || 5000;
        
        try {
            // Use allorigins proxy service directly
            // const html = await this.getContentFromProxy(params.url);
            const html = await this.getContentFromIDE(params.url);

            // Parse HTML content
            const result = this.parseHtmlContent(html, params.url, maxLength);
            
            return {
                code: 200,
                msg: null,
                data: {
                    ...result,
                    source: 'proxy'
                }
            };

        } catch (error) {
            errorReportingService.reportErrorWithException(
                'Web Content Extraction Failed',
                error,
                'error',
                'WebContentExtractor'
            );
            
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                code: 500,
                msg: errorMessage,
                data: {
                    url: params.url,
                    description: '',
                    title: null,
                    favicon: '',
                    truncated: false,
                    source: 'proxy'
                }
            };
        }
    }

    /**
     * Get web content through IDE service (temporarily commented, to be enabled later)
     */
    private async getContentFromIDE(url: string): Promise<string> {
        return await this.ideService.getUrlContent(url);
    }

    /**
     * Get web content through proxy service
     */
    private async getContentFromProxy(url: string): Promise<string> {
        const response = await fetch(`${this.proxyUrl}${encodeURIComponent(url)}`);
        
        if (!response.ok) {
            throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.contents;
    }

    /**
     * Parse HTML content
     */
    private parseHtmlContent(html: string, url: string, maxLength: number) {
        // Create temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Get title
        const titleElement = tempDiv.querySelector('title');
        const title = titleElement ? titleElement.textContent : null;

        // Get favicon
        const favicon = this.extractFavicon(tempDiv, url);

        // Remove unwanted elements
        this.removeUnwantedElements(tempDiv);

        // Get main content
        const content = this.extractMainContent(tempDiv);

        // Clean and truncate content
        const cleanedContent = content.replace(/\s+/g, ' ').trim();
        const truncated = cleanedContent.length > maxLength;
        const finalContent = truncated ? cleanedContent.substring(0, maxLength) : cleanedContent;

        return {
            url,
            description: finalContent,
            title,
            favicon,
            truncated
        };
    }

    /**
     * Extract favicon
     */
    private extractFavicon(tempDiv: HTMLElement, url: string): string {
        // Try to get favicon from link tags
        const faviconLink = tempDiv.querySelector(this.faviconSelectors.join(', '));
        
        if (faviconLink && faviconLink.getAttribute('href')) {
            let faviconHref = faviconLink.getAttribute('href') || '';
            
            // Handle relative paths
            if (faviconHref && !faviconHref.startsWith('http') && !faviconHref.startsWith('data:')) {
                try {
                    const urlObj = new URL(url);
                    if (faviconHref.startsWith('/')) {
                        // Absolute path
                        faviconHref = `${urlObj.protocol}//${urlObj.host}${faviconHref}`;
                    } else {
                        // Relative path
                        faviconHref = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1)}${faviconHref}`;
                    }
                } catch (error) {
                    console.warn('Failed to process favicon relative path:', error);
                }
            }
            return faviconHref;
        }
        
        // If no specific favicon link is found, try default location
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
        } catch (error) {
            console.warn('Failed to generate default favicon URL:', error);
            return '';
        }
    }

    /**
     * Remove unwanted elements
     */
    private removeUnwantedElements(tempDiv: HTMLElement): void {
        const unwantedElements = tempDiv.querySelectorAll(this.removeSelectors.join(', '));
        unwantedElements.forEach(el => el.remove());
    }

    /**
     * Extract main content
     */
    private extractMainContent(tempDiv: HTMLElement): string {
        // Try different selectors by priority
        for (const selector of this.contentSelectors) {
            const element = tempDiv.querySelector(selector);
            if (element && element.textContent) {
                const content = element.textContent.trim();
                if (content.length > 100) { // Ensure content is long enough
                    return content;
                }
            }
        }
        
        // If main content area is not found, get body content
        const bodyContent = tempDiv.querySelector('body');
        if (bodyContent && bodyContent.textContent) {
            return bodyContent.textContent;
        }
        
        // Finally fall back to entire document content
        return tempDiv.textContent || '';
    }
}

export const webContentExtractor = WebContentExtractor.getInstance();

export const extractWebContent = (params: WebContentParams): Promise<WebContentResponse> => {
    return webContentExtractor.extractWebContent(params);
};