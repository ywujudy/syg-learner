<div align="center">
<img src="src/assets/syg-logo.jpg" width="120" alt="思研阁 Logo"/>

# 思研阁 SI YAN GE

**专注数理化提分辅导**

</div>

## 简介

思研阁是一个基于浏览器的英语单词与肌肉记忆训练平台，结合赛道竞速可视化让打字练习更有趣。

## 在线使用

[https://siyange.online](https://siyange.online)

## 本地运行

```bash
yarn install
yarn dev
```

打开 http://localhost:5173 即可。

## 本地构建

```bash
yarn build
```

构建产物会输出到 `build/` 目录。

## 致谢与许可

本项目基于开源项目 [qwerty-learner](https://github.com/RealKai42/qwerty-learner) 二次开发，
原项目采用 [GPL v3 协议](LICENSE)。本项目同样遵循该协议开源。

主要修改：

- 多车道赛车进度可视化（RaceTrack 组件）
- 字母级别的丝滑动画进度
- iPad 设备兼容
- 自定义词库 andystudy
- 品牌定制（UI / Logo / 文案）

衷心感谢原作者 [@RealKai42](https://github.com/RealKai42) 及所有贡献者。
