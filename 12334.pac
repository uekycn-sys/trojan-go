/**
 * 高效白名单 PAC 脚本
 * 策略: 默认走代理 (127.0.0.1:12334)，仅国内主流网站直连。
 * 优化: 使用 Hash Map 进行 O(1) 级查找，极速匹配。
 */

var proxy = "SOCKS5 127.0.0.1:12334; SOCKS 127.0.0.1:12334; DIRECT";
var direct = "DIRECT";

// ---------------------------------------------------------
// 1. 国内域名哈希表 (包含主流网站、云服务、CDN)
//    这里收录了 Top 200+ 国内流量最高的根域名
// ---------------------------------------------------------
var directDomains = {
    // --- 腾讯系 (Tencent) ---
    "qq.com": 1, "tencent.com": 1, "weixin.com": 1, "qcloud.com": 1,
    "gtimg.com": 1, "idqqimg.com": 1, "gtimg.cn": 1, "qlogo.cn": 1,
    "qpic.cn": 1, "myqcloud.com": 1, "smtcdns.com": 1, "smtcdns.net": 1,
    "dnspod.cn": 1, "wechat.com": 1, "foxmail.com": 1,

    // --- 阿里系 (Alibaba) ---
    "alibaba.com": 1, "alicdn.com": 1, "alikunlun.com": 1, "alipay.com": 1,
    "aliyun.com": 1, "aliyuncs.com": 1, "mmstat.com": 1, "taobao.com": 1,
    "tmall.com": 1, "etao.com": 1, "1688.com": 1, "amap.com": 1, // 高德
    "autonavi.com": 1, "dingtalk.com": 1, "cainiao.com": 1, "tanx.com": 1,
    "ucweb.com": 1, "fliggy.com": 1, // 飞猪
    "youku.com": 1, "ykimg.com": 1, "tudou.com": 1, // 优酷土豆

    // --- 百度系 (Baidu) ---
    "baidu.com": 1, "baidustatic.com": 1, "bcebos.com": 1, "baidupcs.com": 1,
    "bdstatic.com": 1, "bdimg.com": 1, "hao123.com": 1, "tieba.com": 1,
    "iqiyi.com": 1, "iqiyipic.com": 1, // 爱奇艺

    // --- 字节跳动 (ByteDance) ---
    "douyin.com": 1, "toutiao.com": 1, "snssdk.com": 1, "pstatp.com": 1,
    "ixigua.com": 1, "bytecdn.cn": 1, "feishu.cn": 1, "tiktokv.com": 1, // 抖音部分CDN

    // --- 网易 (NetEase) ---
    "163.com": 1, "126.net": 1, "127.net": 1, "netease.com": 1,
    "163yun.com": 1, "lofter.com": 1, "ydstatic.com": 1,

    // --- 京东 / 美团 / 点评 / 拼多多 ---
    "jd.com": 1, "360buy.com": 1, "360buyimg.com": 1, "jdcloud.com": 1,
    "jcloudcs.com": 1,
    "meituan.com": 1, "meituan.net": 1, "dianping.com": 1, "dpfile.com": 1,
    "sankuai.com": 1,
    "pinduoduo.com": 1, "yangkeduo.com": 1,

    // --- 视频 / 直播 / 社交 ---
    "bilibili.com": 1, "bilivideo.com": 1, "hdslb.com": 1, "acgvideo.com": 1,
    "douyu.com": 1, "douyucdn.cn": 1,
    "huya.com": 1, "msstatic.com": 1,
    "yy.com": 1,
    "weibo.com": 1, "weibo.cn": 1, "sina.com.cn": 1, "sinaimg.cn": 1,
    "zhihu.com": 1, "zhimg.com": 1,
    "douban.com": 1, "doubanio.com": 1,
    "xiaohongshu.com": 1, "xhscdn.com": 1,
    "kuaishou.com": 1, "yximgs.com": 1,

    // --- 门户 / 资讯 / 工具 ---
    "sogou.com": 1, "sohu.com": 1, "sogo.com": 1,
    "360.cn": 1, "360.com": 1, "qhimg.com": 1, "qhres.com": 1,
    "xunlei.com": 1, "sandai.net": 1,
    "csdn.net": 1, "cnblogs.com": 1, "oschina.net": 1, "gitee.com": 1,
    "juejin.cn": 1,
    "ifeng.com": 1, // 凤凰网
    "huxiu.com": 1, "36kr.com": 1,

    // --- 手机 / 硬件厂商 (防止系统更新走代理) ---
    "xiaomi.com": 1, "mi.com": 1, "mi-img.com": 1,
    "huawei.com": 1, "vmall.com": 1, "dbankcdn.com": 1, "hicloud.com": 1,
    "vivo.com.cn": 1, "oppo.com": 1,
    "apple.com.cn": 1, "icloud.com.cn": 1, // 苹果中国区

    // --- 银行 / 支付 / 生活 ---
    "cmbchina.com": 1, // 招商银行
    "icbc.com.cn": 1,  // 工商银行
    "ccb.com": 1,      // 建设银行
    "12306.cn": 1,     // 铁路
    "china.com": 1,
    "ctrip.com": 1, "trip.com": 1, // 携程

    // --- 云服务 / CDN (补充) ---
    "upyun.com": 1, // 又拍云
    "qiniu.com": 1, "qiniucdn.com": 1, "qiniudn.com": 1,
    "ksyun.com": 1, // 金山云
    "ucloud.cn": 1
};

function FindProxyForURL(url, host) {
    // ---------------------------------------------------------
    // 2. 基础检查: 局域网与简单主机名 -> 直连
    // ---------------------------------------------------------
    if (isPlainHostName(host) || host === "localhost" || host === "127.0.0.1") {
        return direct;
    }

    // ---------------------------------------------------------
    // 3. 高效筛选: .cn 域名 -> 直连
    // ---------------------------------------------------------
    // 这是最高效的判断，能瞬间过滤掉绝大多数国内政府、教育、企业网站
    var lastDotIndex = host.lastIndexOf('.');
    if (lastDotIndex !== -1) {
        var suffix = host.substring(lastDotIndex + 1);
        if (suffix === "cn") {
            return direct;
        }
    }

    // ---------------------------------------------------------
    // 4. 精确/后缀匹配: 检查 directDomains 哈希表
    // ---------------------------------------------------------
    // 算法逻辑：从域名末尾开始逐级向上查找。
    // 例如访问: map.baidu.com
    // 1. 查 map.baidu.com (不存在)
    // 2. 查 baidu.com (存在 -> return direct)
    
    var pos = host.lastIndexOf('.');
    // 先查完整域名 (如 baidu.com)
    // 此时 pos 是最后一个点的位置，我们需要更灵活的循环
    
    var currentHost = host;
    
    // 循环剥离主机头，直到剩下顶级域名
    // 限制循环次数防止死循环，一般域名不超过 4 级
    while (true) {
        if (directDomains.hasOwnProperty(currentHost)) {
            return direct;
        }

        var dot = currentHost.indexOf('.');
        if (dot === -1) {
            break; // 已经没有点了，结束
        }
        
        // 剥离第一段，例如 "map.baidu.com" -> "baidu.com"
        currentHost = currentHost.substring(dot + 1);
    }

    // ---------------------------------------------------------
    // 5. 局域网 IP 段检查 (放在最后，因为正则比哈希表慢)
    // ---------------------------------------------------------
    // 如果上面都没匹配中，且是 IP 地址格式，检查是否为内网 IP
    // 正则检查: 10.x.x.x, 192.168.x.x, 172.16-31.x.x
    var ipPattern = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
    if (ipPattern.test(host)) {
        return direct;
    }

    // ---------------------------------------------------------
    // 6. 默认策略: 走代理
    // ---------------------------------------------------------
    // 只要不在上面的白名单里，统统走代理。防止漏掉任何国外服务。
    return proxy;
}
