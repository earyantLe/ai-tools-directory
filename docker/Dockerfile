# OpenClaw AI Tools Runner
# 预装 OpenClaw 的自定义镜像，用于 GitHub Actions

FROM ubuntu:22.04

# 防止交互式提示
ENV DEBIAN_FRONTEND=noninteractive

# 安装基础依赖
RUN apt-get update && apt-get install -y \
    curl \
    git \
    nodejs \
    npm \
    jq \
    cron \
    && rm -rf /var/lib/apt/lists/*

# 安装 OpenClaw
RUN npm install -g openclaw

# 创建工作目录
WORKDIR /root/.openclaw/workspace

# 预创建目录结构
RUN mkdir -p /root/.openclaw/{workspace,cron,logs,extensions}

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD openclaw --version || exit 1

# 默认命令
ENTRYPOINT ["openclaw"]
CMD ["--help"]
