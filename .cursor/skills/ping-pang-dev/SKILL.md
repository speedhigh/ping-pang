---
name: ping-pang-dev
description: >-
  Guides implementation of the Ping-Pang mobile PWA scoreboard (Vue 3, TypeScript,
  Tailwind). Use when scaffolding the project, building usePingPongGame, UI
  components, PWA, themes, serve indicator, or match/series win flows in
  ping-pang.
---

# Ping-Pang 开发流程

## 实现顺序

1. **脚手架** — Vite + Vue 3 + TS + Tailwind + VueUse + vite-plugin-pwa
2. **领域模型** — `Participant`、比分、大局配置、发球状态类型
3. **`usePingPongGame()`** — 加分、Undo、重置、胜负、发球计算、LocalStorage
4. **核心 UI** — 球桌布局、`PlayerHalf`（含发球描边/微光）、球网
5. **反馈** — 小局 Win / 大局 Win 两级 `WinOverlay`
6. **设置** — 选手名、大局赛制、主题、首球发球方
7. **PWA** — manifest、SW、Wake Lock、全屏 meta

每步完成后可运行；逻辑层先写单测再接 UI。

## 推荐目录

```
src/
  composables/usePingPongGame.ts
  composables/useTheme.ts
  components/PlayerHalf.vue
  components/NetDivider.vue
  components/WinOverlay.vue
  components/SettingsPanel.vue
  types/game.ts
  utils/serveRotation.ts
  utils/scoring.ts
  themes/
  App.vue
```

## usePingPongGame 职责

| 职责 | 说明 |
|------|------|
| 状态 | scores、gameWins、currentGameIndex、matchFormat、participants、firstServer |
| 动作 | score(playerId)、undo()、resetGame()、resetMatch()、setMatchFormat() |
| 派生 | currentServer、isGameOver、isMatchOver、gameWinner、matchWinner |
| 持久化 | useLocalStorage 或等价封装，key 如 `ping-pang-state` |

UI 禁止 duplicated 规则逻辑。

## 发球实现要点

- 提取 `getCurrentServer(scoreA, scoreB, firstServer)` 到 `utils/serveRotation.ts`（常规每 2 分换发；10:10 起每 1 分换发，见 reference.md）
- `PlayerHalf` 接收 `isServing` prop，用 Tailwind ring/box-shadow 做低饱和提示
- 小局结束后：清零小分，更新 firstServer（局间交替），重置 serving 显示

## 胜利流程

```
score → 判定小局结束？
  ├─ 否 → 更新发球指示
  └─ 是 → 有大局？
        ├─ 否 → 单场 Win（大局级反馈）
        └─ 是 → 更新 gameWins → 系列赛结束？
              ├─ 否 → 小局 Win → 下一局
              └─ 是 → 大局 Win
```

反馈：震动 `navigator.vibrate?.(10)`；动画用 CSS transition，避免游戏化库。

## 主题

CSS 变量：`--table-surface`、`--table-border`、`--serve-glow`、`--text-primary`。Classic Arena 为默认：深墨绿台面、低饱和文字。

## 自检清单

- [ ] 点击半区即可加分，无主按钮抢焦点
- [ ] 10:10 后发球每分轮换正确
- [ ] Undo 后发球指示正确
- [ ] 未选大局时仅单场 Win；选大局时小局/大局反馈强度可区分
- [ ] 刷新后状态恢复
- [ ] 无高饱和/电竞风配色
- [ ] 次要操作不易误触

## 详细规则

见 [reference.md](reference.md)
