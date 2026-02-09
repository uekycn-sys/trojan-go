#!/bin/bash

# =================================================================
# 逻辑推导：
# 1. BASH_SOURCE[0] 获取脚本的相对或绝对路径
# 2. dirname 提取该路径的目录部分
# 3. cd 进入该目录，确保 ./trojan-go 的相对路径查找有效
# =================================================================

# 切换到脚本所在目录
cd "$(dirname "${BASH_SOURCE[0]}")"
pkill trojan-go

./trojan-go -config config.1080.yaml &> p1080.log &
./trojan-go -config config.1081.yaml &> p1081.log &
