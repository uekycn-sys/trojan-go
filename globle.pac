function FindProxyForURL(url, host) {
    // ---------------------------------------------------------
    // 1. 定义代理配置
    // ---------------------------------------------------------
    // CDN 优选 (1081): 默认稳定路径，适合网页、AI、API
    var CDN_PROXY = "SOCKS5 127.0.0.1:1081; SOCKS 127.0.0.1:1081; DIRECT";
    // GCE 直连 (1080): 仅限高流量流媒体
    var GCE_PROXY = "SOCKS5 127.0.0.1:1080; SOCKS 127.0.0.1:1080; DIRECT";

    // ---------------------------------------------------------
    // 2. 基础过滤：局域网与本地流量 (DIRECT)
    // ---------------------------------------------------------
    if (isPlainHostName(host) ||
        host === "127.0.0.1" ||
        host === "localhost" ||
        host === "::1" ||
        shExpMatch(host, "10.*") ||
        shExpMatch(host, "172.1[6-9].*") ||
        shExpMatch(host, "172.2[0-9].*") ||
        shExpMatch(host, "172.3[0-1].*") ||
        shExpMatch(host, "192.168.*") ||
        shExpMatch(host, "*.local")) {
        return "DIRECT";
    }

    // ---------------------------------------------------------
    // 3. 高流量判定：强制走 GCE (1080)
    // ---------------------------------------------------------
    // 包含 YouTube 全家桶及其视频流域名
    if (shExpMatch(host, "*.youtube.com") ||
        shExpMatch(host, "youtube.com") ||
        shExpMatch(host, "*.googlevideo.com") || // 核心视频流
        shExpMatch(host, "*.ytimg.com") ||       // 视频图片/封面
        shExpMatch(host, "*.ggpht.com") ||       // 用户头像等静态资源
        shExpMatch(host, "youtu.be") ||
        shExpMatch(host, "*.nhacplus.com") ||    // 部分流媒体 CDN
        shExpMatch(host, "*.netflix.com") ||     // 可选：Netflix
        shExpMatch(host, "*.nflxvideo.net")) {
        return GCE_PROXY;
    }

    // ---------------------------------------------------------
    // 4. 默认策略：走 CDN 优选 (1081)
    // ---------------------------------------------------------
    // 包含 Google 搜索、Gemini、GitHub 等一切非视频流量
    return CDN_PROXY;
}
