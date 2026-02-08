function FindProxyForURL(url, host) {
    // ---------------------------------------------------------
    // 1. 定义代理链 (Failover 机制)
    // ---------------------------------------------------------
    // 逻辑：优先尝试 SOCKS5，若失败尝试 SOCKS(v4)，若皆失败则 DIRECT 直连
    // 这解决了你要求的“本地端口无效时能直连”的需求
    var proxy = "SOCKS5 127.0.0.1:1080; SOCKS 127.0.0.1:1080; DIRECT";

    // ---------------------------------------------------------
    // 2. IPv6 与 本地回环屏蔽 (强制 IPv4 逻辑)
    // ---------------------------------------------------------
    // 显式排除 IPv6 地址和本地地址
    if (isPlainHostName(host) || 
        host === "127.0.0.1" || 
        host === "localhost" || 
        host === "::1" ||
        shExpMatch(host, "*:*:*")) { // 匹配任何包含冒号的 IPv6 地址
        return "DIRECT";
    }

    // ---------------------------------------------------------
    // 3. 局域网直连 (极度理性的性能优化)
    // ---------------------------------------------------------
    // 即使是“暴力全局”，通常也不建议将局域网流量丢给代理，避免内网服务失效
    if (shExpMatch(host, "10.*") || 
        shExpMatch(host, "172.16.*") || 
        shExpMatch(host, "172.17.*") || 
        shExpMatch(host, "172.18.*") || 
        shExpMatch(host, "172.19.*") || 
        shExpMatch(host, "172.20.*") || 
        shExpMatch(host, "172.21.*") || 
        shExpMatch(host, "172.22.*") || 
        shExpMatch(host, "172.23.*") || 
        shExpMatch(host, "172.24.*") || 
        shExpMatch(host, "172.25.*") || 
        shExpMatch(host, "172.26.*") || 
        shExpMatch(host, "172.27.*") || 
        shExpMatch(host, "172.28.*") || 
        shExpMatch(host, "172.29.*") || 
        shExpMatch(host, "172.30.*") || 
        shExpMatch(host, "172.31.*") || 
        shExpMatch(host, "192.168.*")) {
        return "DIRECT";
    }

    // ---------------------------------------------------------
    // 4. 最终输出
    // ---------------------------------------------------------
    return proxy;
}
