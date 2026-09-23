本程序使用AI辅助开发，使用谷歌Gemini 3.8 flash

NodePulse 代理网络测速与出境链路诊断工具，深度对标 speed.cloudflare.com 的设计语言与度量标准，针对中国大陆 GFW 干扰及代理节点特性进行了全面定制。

---

## 🛠️ 本地运行指南（解决下载源码打开空白问题）

本项目是基于 **React 19 + TypeScript + Vite** 构建的现代化前端应用，**不能直接用浏览器双击打开 `index.html`**（直接双击浏览器会受同源策略 CORS 及 ES Module 加载限制导致白屏）。

### 推荐运行步骤：

#### 1. 环境准备
确保本机安装了 Node.js（推荐版本 **Node 18+** 或 **Node 20+**）：
```bash
node -v
npm -v
```

#### 2. 安装依赖并启动本地开发服务器
在项目根目录下打开终端，依次运行：
```bash
# 安装项目所有依赖
npm install

# 启动本地开发服务
npm run dev
```

终端会显示运行地址（通常为 `http://localhost:3000` 或 `http://localhost:5173`），在浏览器中打开该地址即可正常访问并测速。

#### 3. 生产环境打包并预览
如需打包为静态文件：
```bash
# 编译打包静态文件到 dist/ 目录
npm run build

# 本地预览构建产物
npm run preview
```
产物在 `dist/` 目录下，可直接放置于任何 Web 服务器（Nginx、Caddy、Apache、Docker 或静态托管平台）中运行。

---

## 🖥️ 编译打包 Windows / macOS / Linux 桌面原生应用 (.exe)

本项目已支持 **Tauri v2**，可一键将应用编译为超轻量（仅 ~15MB，内存占用仅 ~30MB）的原生桌面客户端。

### Windows 打包前置环境（仅需准备一次）
1. 安装 **Rust**：访问 [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install) 下载运行 `rustup-init.exe`。
2. 安装 **C++ 生成工具**（Visual Studio Build Tools，勾选 "C++ 桌面开发"）。
3. 安装 **WebView2 运行时**（Windows 10 / 11 绝大多数电脑已自带）。

### 编译打包命令
在项目根目录下执行：
```bash
# 1. 编译前端静态资源
npm run build

# 2. 调用 Tauri 编译生成原生 .exe / .msi 安装包
npx @tauri-apps/cli build
```
编译成功后，原生安装包将生成在：
`src-tauri/target/release/bundle/nsis/NodePulse_1.0.0_x64-setup.exe`
或便携版：
`src-tauri/target/release/NodePulse.exe`

