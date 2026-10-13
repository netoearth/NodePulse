# NodePulse (节点脉冲) ⚡

> 专业的网络代理测速、全球路由节点延迟与丢包率诊断、出口 IP 归属及流媒体解锁检测工具。媲美 speed.cloudflare.com 的精美交互式分析仪表盘。

[![Tauri v2 Desktop Release](https://img.shields.io/badge/Tauri-v2.0-24C8DB?logo=tauri&logoColor=white)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Windows%20%7C%20macOS%20%7C%20Linux-brightgreen)](#-原生桌面端跨平台支持)

---

## 🌟 核心功能特性

- **🚀 实时双向吞吐量测速**：多并发下载与上传速率测试，毫秒级平滑采样，计算当前实时速度与峰值速率曲线。
- **📊 连续脉冲延迟与丢包探测**：高频次模拟发包可视化网格，精准统计最小延迟、中位数延迟、最大延迟、抖动（Jitter）及丢包百分比。
- **🌍 出口网络与 ASN 深度画像**：自动识别并展示当前代理/网络的公网 IPv4/IPv6、ASN 自治系统编号、ISP 运营商、机房位置及地理坐标。
- **🗺️ 全球骨干路由节点阵列**：覆盖北美、欧洲、东亚、东南亚等全球主流骨干机房节点（Cloudflare、Fastly、AWS 等），支持实时延迟对比及自定义节点探测。
- **🎬 主流流媒体与 AI 服务解锁检测**：一键诊断 Netflix、YouTube Premium、Disney+、ChatGPT、Spotify 等服务的落地解锁状况。
- **📑 诊断报告导出**：一键生成结构化网络健康诊断报告，支持快速复制到剪贴板以便节点排错与工单反馈。
- **🖥️ 跨平台原生桌面端支持**：基于 Tauri v2 驱动，极速启动、超低内存占用，提供与 Web 端一致的极致交互体验。

---

## 🖥️ 原生桌面端跨平台支持

本项目采用 **Tauri v2** 原生架构，已配置 GitHub Actions 全自动多平台发布流水线：

| 平台架构 | 安装包格式 | 说明 |
| :--- | :--- | :--- |
| **macOS** | `.dmg` (Universal Binary) | 原生通用二进制，单文件兼容 Apple Silicon (M1/M2/M3/M4) 与 Intel 芯片 |
| **Windows** | `.exe` (NSIS) / `.msi` | 适用于 Windows 10 / 11 64 位原生安装包 |
| **Linux** | `.deb` / `.AppImage` | 适配主流发行版（Ubuntu/Debian/Arch 等），集成 WebKitGTK 4.1 运行时 |

### 🚀 触发全自动跨平台编译与发布

本项目已配置独立 CI/CD 流水线（`.github/workflows/release.yml`）：

1. **推送版本 Tag（推荐）**：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. **在 GitHub 页面手动触发**：
   - 进入仓库 **Actions** 选项卡。
   - 选择 **🌐 Cross-Platform Build & Release** 工作流。
   - 点击 **Run workflow**，输入版本号 Tag（例如 `v1.0.0`）及发布标题即可全自动并行编译并创建 GitHub Releases。

---

## 🛠️ 本地开发与构建

### 1. 环境要求
- **Node.js** >= 20 LTS (推荐 22 LTS)
- **Rust** >= 1.77.2 (若需本地调试或打包桌面端)
- **npm** / **bun** / **pnpm**

### 2. 安装依赖
```bash
npm install
```

### 3. 启动 Web 本地开发服务
```bash
npm run dev
```
本地访问：`http://localhost:3000`

### 4. 前端构建与代码校验
```bash
# 类型检查与 Lint
npm run lint

# 前端静态资源打包
npm run build
```

### 5. 本地运行 / 调试 Tauri 桌面端
```bash
# 启动桌面端调试窗口 (前后端热重载)
npx tauri dev

# 本地构建当前操作系统的桌面端安装包
npx tauri build
```

---

## 📁 目录架构概览

```text
├── .github/
│   └── workflows/
│       └── tauri-release.yml    # Tauri v2 跨平台全自动编译与 GitHub Release 流程
├── src/
│   ├── components/              # 核心 UI 组件
│   │   ├── Header.tsx           # 顶栏导航与运行控制
│   │   ├── HeroTelemetry.tsx    # 实时测速仪表盘与历史速率图表
│   │   ├── PacketLossVisualizer.tsx # 40格连续脉冲延迟与丢包检测器
│   │   ├── EgressInspector.tsx  # 出口 IP、ASN 及运营商详情
│   │   ├── RouteNodeMatrix.tsx  # 全球路由节点延迟矩阵
│   │   ├── StreamingUnlockProbe.tsx # 流媒体与 AI 解锁测试
│   │   └── DiagnosticReportModal.tsx # 诊断报告弹窗
│   ├── services/
│   │   └── networkProbes.ts     # 高并发测速、Ping、出口与解锁检测逻辑
│   ├── types.ts                 # 全局 TypeScript 接口定义
│   ├── App.tsx                  # 应用主入口
│   └── index.css                # 样式系统 (Tailwind CSS)
├── src-tauri/                   # Tauri v2 原生桌面端核心配置与 Rust 源码
│   ├── src/main.rs              # Tauri 后台主入口
│   ├── Cargo.toml               # Rust 依赖声明
│   ├── tauri.conf.json          # 桌面端视窗、权限与构建配置
│   └── icons/                   # 多平台高清应用图标 (.ico, .icns, .png)
├── index.html                   # Web 页面主模板
├── package.json                 # 项目依赖配置
├── tsconfig.json                # TypeScript 编译配置
└── vite.config.ts               # Vite 打包配置
```

---

## 🔒 隐私与免责声明

- 本工具所有测速与探测行为均在客户端本地发起，测速数据即测即走，不存储任何用户的网络日志或隐私数据。
- 流媒体与出口检测结果基于客户端直连探针或公共开放接口返回结果判定，仅供网络故障诊断与性能分析使用。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。欢迎提交 Issue 或 Pull Request！
