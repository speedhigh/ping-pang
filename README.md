# 乒乓球计分器

移动端优先的乒乓球计分 PWA，可添加到手机桌面、离线使用。

## 技术栈

Vue 3 · TypeScript · Tailwind CSS · VueUse · Vite · PWA

## 开发

```bash
nvm use 22
pnpm install
pnpm dev
```

浏览器打开终端里显示的地址（通常是 `http://localhost:5173`）。

## 脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 本地开发 |
| `pnpm build` | 生产构建（输出到 `dist/`） |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm test` | 运行单元测试 |

<!-- ## 发布到线上

PWA 必须通过 **HTTPS** 访问（`localhost` 开发除外）。任选一种静态托管即可：

### 方式一：GitHub Pages（本仓库已配置）

推送 `main_github` 分支后，GitHub Actions 会自动构建并部署。

| 线路 | 地址 | 说明 |
|------|------|------|
| 国际 / 默认 | https://speedhigh.github.io/ping-pang/ | GitHub Pages 官方地址 |
| 国内加速镜像 | https://cdn.jsdelivr.net/gh/speedhigh/ping-pang@gh-pages/ | jsDelivr CDN，大陆访问通常更快 |

**首次启用**（只需做一次）：仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

也可在 **Actions** 页手动 **Run workflow** 触发部署。

### 方式二：Vercel（免费）

1. 代码推到 GitHub
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
3. **Import** 该仓库，框架选 **Vite**，构建命令 `pnpm build`，输出目录 `dist`
4. 部署完成后会得到 `https://xxx.vercel.app` 地址

### 方式三：Netlify

1. 代码推到 GitHub
2. [netlify.com](https://www.netlify.com) → **Add new site** → 连接仓库
3. Build command: `pnpm build`，Publish directory: `dist`
4. 部署后获得 `https://xxx.netlify.app`

### 方式四：Cloudflare Pages

1. 代码推到 GitHub
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → Pages
3. 连接仓库，构建设置同上

### 方式五：自建服务器 / NAS

```bash
pnpm build
# 将 dist/ 目录内容放到 Nginx / Caddy 等静态站点根目录，并配置 HTTPS
```

本地先验证构建结果：

```bash
pnpm build
pnpm preview
# 手机与电脑同一 WiFi 下，访问 http://<电脑局域网IP>:4173
``` -->

## 在手机上使用

### 第一次：用浏览器打开线上地址

部署完成后，用手机 **Safari（iPhone）** 或 **Chrome（Android）** 打开你的 HTTPS 链接。

### 添加到桌面（像 App 一样用）

**iPhone（Safari）**

1. 打开网站
2. 点底部分享按钮
3. 选择 **「添加到主屏幕」**
4. 名称显示为「乒乓球计分器」，确认添加

**Android（Chrome）**

1. 打开网站
2. 点右上角菜单 ⋮
3. 选择 **「添加到主屏幕」** 或 **「安装应用」**
4. 确认安装

之后从桌面图标进入，会以全屏独立窗口打开，记分数据保存在本机浏览器（LocalStorage），无需登录。

### 使用建议

- 放在球桌旁，竖屏或按设置里的 **布局方向** 横放均可
- 首次可在 **设置** 里配置选手名、赛制、主题、文字朝向
- 需要更新版本时重新部署；已安装的 PWA 会在下次打开时自动拉取新版本

## Node

推荐使用 Node 22（`.nvmrc` 已配置）。
