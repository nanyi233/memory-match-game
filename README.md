# 🃏 记忆配对卡牌游戏

一款精美的记忆配对卡牌游戏，使用纯HTML5、CSS3和JavaScript开发，支持多种主题、多人游戏模式和排行榜功能。

## ✨ 功能特性

### 🎮 游戏模式
- **单人模式**: 挑战自己，追求最高分
- **多人模式**: 2-4人轮流游戏，支持自定义玩家名

### 🎯 难度等级
- **简单**: 4×3 网格 (6对卡片)
- **中等**: 4×4 网格 (8对卡片)
- **困难**: 6×4 网格 (12对卡片)
- **专家**: 6×6 网格 (18对卡片)

### 🎨 主题系统
- 表情主题 😀🎮🌟
- 动物主题 🐱🐶🐰
- 食物主题 🍕🍔🍦
- 太空主题 🚀🌙⭐
- 运动主题 ⚽🏀🎾
- 自然主题 🌸🌴🌈

### 🌈 背景颜色
- 默认紫色渐变
- 海洋蓝
- 森林绿
- 日落橙
- 薰衣草紫
- 暗黑模式

### 🎵 音效系统
- 卡片翻转音效
- 配对成功音效
- 配对失败音效
- 连击奖励音效
- 胜利音效
- 可调节音量

### 📊 计分系统
- 基础配对分数
- 连击加成奖励
- 时间奖励
- 效率奖励
- 完美通关奖励
- 星级评定 (1-3星)

### ♿ 无障碍功能
- 完整键盘导航支持
- 高对比度模式
- 减少动画模式
- ARIA标签支持
- 屏幕阅读器友好

### 🏆 排行榜
- 分难度排名
- 本地存储持久化
- 显示分数、时间、步数

## 🚀 快速开始

### 方式一: 直接打开
1. 下载项目文件
2. 双击 `index.html` 文件
3. 在浏览器中开始游戏

### 方式二: 本地服务器
```bash
# 使用 Python 3
python -m http.server 8080

# 使用 Node.js (需要安装 http-server)
npx http-server

# 使用 VS Code Live Server 插件
# 右键点击 index.html -> "Open with Live Server"
```

然后访问 `http://localhost:8080`

## ⌨️ 键盘快捷键

| 按键 | 功能 |
|------|------|
| ↑↓←→ | 移动选择 |
| 空格/回车 | 翻转卡片 |
| Esc | 暂停游戏 |
| M | 静音切换 |

## 📁 项目结构

```
memory-match-game/
├── index.html              # 主HTML文件
├── README.md               # 项目说明
├── css/
│   ├── styles.css          # 主样式
│   ├── themes.css          # 主题样式
│   └── animations.css      # 动画样式
└── js/
    ├── main.js             # 主入口
    ├── core/
    │   ├── Card.js         # 卡片类
    │   ├── CardThemes.js   # 主题管理
    │   ├── GameBoard.js    # 游戏板
    │   ├── GameController.js # 游戏控制器
    │   └── ScoreSystem.js  # 计分系统
    ├── ui/
    │   └── UIManager.js    # UI管理
    └── utils/
        ├── AudioManager.js  # 音频管理
        └── StorageManager.js # 存储管理
```

## 🛠️ 技术实现

### 核心技术
- **HTML5**: 语义化标签、ARIA无障碍属性
- **CSS3**: Flexbox/Grid布局、3D变换、自定义属性
- **JavaScript**: ES6+模块化、Web Audio API

### 性能优化
- CSS3硬件加速动画
- 事件委托减少监听器
- 防抖处理优化性能
- 高效的内存管理

### 浏览器兼容
- Chrome (推荐)
- Firefox
- Safari
- Edge
- 移动端浏览器

## 📱 响应式设计

- 桌面端: 完整功能体验
- 平板端: 自适应布局
- 手机端: 触控优化

## 🎯 游戏规则

1. 点击卡片将其翻开
2. 记住卡片上的图案位置
3. 连续翻开两张相同图案的卡片即可配对成功
4. 配对成功的卡片保持翻开状态
5. 找出所有配对即可通关
6. 用更少的步数和更短的时间获得更高分数
7. 连续配对成功可获得连击奖励

## 🔧 自定义配置

### 添加新主题
在 `js/core/CardThemes.js` 中添加新的图标数组:

```javascript
newTheme: {
    name: '新主题',
    icons: ['🎁', '🎉', '🎊', ...]  // 至少36个图标
}
```

### 调整计分参数
在 `js/core/ScoreSystem.js` 中修改配置:

```javascript
this.config = {
    baseMatchScore: 100,      // 基础分数
    comboMultiplier: 0.5,     // 连击倍率
    maxComboMultiplier: 5,    // 最大连击倍率
    // ...
};
```

## 📄 许可证

MIT License - 自由使用、修改和分发

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

🎮 **开始游戏，挑战你的记忆力吧！**
