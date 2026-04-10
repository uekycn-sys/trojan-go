/**
 * 高效流量分流脚本 (V3.0 - 国内主流流量全量直连)
 * 逻辑：基于哈希表的快速匹配 + 后缀探测
 */

var proxy = "SOCKS5 127.0.0.1:12334; SOCKS 127.0.0.1:12334; DIRECT";
var direct = "DIRECT";

var directDomains = {
    // --- 核心基础设施与 Apple (确保登录稳定) ---
    "apple.com": 1, "icloud.com": 1, "mzstatic.com": 1, "apple.com.cn": 1, "icloud.com.cn": 1,
    "digicert.com": 1, "entrust.net": 1,

    // --- 腾讯系 (WeChat, QQ, Games) ---
    "qq.com": 1, "tencent.com": 1, "weixin.com": 1, "qcloud.com": 1, "gtimg.com": 1,
    "idqqimg.com": 1, "qlogo.cn": 1, "qpic.cn": 1, "smtcdns.com": 1, "dnspod.cn": 1,

    // --- 阿里系 (Taobao, Aliyun, Alipay) ---
    "alibaba.com": 1, "alicdn.com": 1, "alipay.com": 1, "aliyun.com": 1, "taobao.com": 1,
    "tmall.com": 1, "mmstat.com": 1, "amap.com": 1, "dingtalk.com": 1, "cainiao.com": 1,

    // --- 百度系 (Search, Map, Tieba) ---
    "baidu.com": 1, "baidustatic.com": 1, "bdimg.com": 1, "bcebos.com": 1, "tieba.com": 1,

    // --- 字节/生活/社交 (Douyin, Meituan, Weibo) ---
    "douyin.com": 1, "toutiao.com": 1, "snssdk.com": 1, "pstatp.com": 1, "ixigua.com": 1,
    "meituan.com": 1, "dianping.com": 1, "sankuai.com": 1, "pinduoduo.com": 1, "yangkeduo.com": 1,
    "weibo.com": 1, "sina.com.cn": 1, "sinaimg.cn": 1, "zhihu.com": 1, "zhimg.com": 1,
    "xiaohongshu.com": 1, "xhscdn.com": 1, "douban.com": 1, "doubanio.com": 1,

    // --- 视频/娱乐 (Bilibili, iQIYI, NetEase) ---
    "bilibili.com": 1, "bilivideo.com": 1, "hdslb.com": 1, "acgvideo.com": 1,
    "iqiyi.com": 1, "iqiyipic.com": 1, "youku.com": 1, "ykimg.com": 1,
    "163.com": 1, "126.net": 1, "netease.com": 1, "kuaishou.com": 1, "yximgs.com": 1,

    // --- 技术/开发/厂商 (CSDN, Gitee, Xiaomi) ---
    "csdn.net": 1, "gitee.com": 1, "juejin.cn": 1, "cnblogs.com": 1,
    "xiaomi.com": 1, "mi.com": 1, "huawei.com": 1, "vmall.com": 1, "oppo.com": 1, "vivo.com": 1,
    "jd.com": 1, "360buyimg.com": 1, "suning.com": 1,

    // --- 银行/金融/公共 ---
    "cmbchina.com": 1, "icbc.com.cn": 1, "ccb.com": 1, "abchina.com": 1, "boc.cn": 1,
    "12306.cn": 1, "gov.cn": 1, "jin10.com": 1
};

function FindProxyForURL(url, host) {
    // 1. 屏蔽所有非公网请求
    if (isPlainHostName(host) || host === "localhost" || host === "127.0.0.1" || host === "::1") return direct;

    // 2. 特征后缀极速分流 (处理 90% 的国内政府、教育及企业站)
    var lastDot = host.lastIndexOf('.');
    if (lastDot !== -1) {
        var suffix = host.substring(lastDot + 1);
        if (suffix === "cn") return direct;
    }

    // 3. 递归域名哈希查找 (处理主流 APP 和顶级站点)
    var currentHost = host;
    while (true) {
        if (directDomains.hasOwnProperty(currentHost)) return direct;
        var dot = currentHost.indexOf('.');
        if (dot === -1) break;
        currentHost = currentHost.substring(dot + 1);
    }

    // 4. 私有网段探测
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) return direct;

    // 5. 默认走代理
    return proxy;
}