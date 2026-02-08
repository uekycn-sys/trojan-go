#!/bin/bash

rm -f geosite.dat geoip.dat trojan-go

# 下载黑白名单
curl http://gh.ueky.cn/v2fly/domain-list-community/release/dlc.dat -o geosite.dat 
curl http://gh.ueky.cn/v2fly/geoip/release/geoip.dat -o geoip.dat

# 编译
go build -tags "full"
