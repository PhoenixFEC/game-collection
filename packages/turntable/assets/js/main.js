
const baseData = {
  dpr: window.devicePixelRatio,
  // 640 为设计稿默认宽度（像素）
  ratio: 640 / window.innerWidth,
  circleAngle: Math.PI * 2,
  // 默认转5圈
  laps: 5,
}

// 可根据接口请求赋值以下数据
const baseConf = {
  turnTime: 2000,
  turnoff: false,
  // 有效抽奖次数，可抽奖次数上限
  turnMax: 4,
  // 当前已抽奖次数
  turnCount: 0,
  // 设置奖品数（含“谢谢参与”）
  prizeCount: 8,
  // 设计稿宽度640
  // 转盘距离页面顶部距离（单位像素）
  turntableMarginTop: 318,
  realTurntableRadius: 238,
  plateColor: ['0xffffff', '0xf4b79f'], // 0xfcbd66
}
// 转盘素材资源
let turntableData = {}
let actionsData = {}
let prizesData = {}
let bgData = {}
// Start 请求接口获取对应数据赋值 
turntableData = {
  name: 'turntable',
  assets: [
    {
      name: 'turntableBg',
      srcs: 'assets/img/turntable-bg.png',
    },
    // {
    //   name: 'turntableWallpaper',
    //   srcs: 'assets/img/turntable-wallpaper.png',
    // }
  ]
}
actionsData = {
  name: 'actions',
  assets: [
    {
      name: 'btnLauncher',
      srcs: 'assets/img/btn-launcher.png'
    }
  ]
}
prizesData = {
  name: 'prizes',
  assets: [
    {
      name: 'prize0',
      srcs: 'assets/img/prize-0.png',
      title: '谢谢参与',
      desc: '很抱歉什么也没有'
    },
    {
      name: 'prize1',
      srcs: 'assets/img/prize-1.png',
      title: '一等奖',
      desc: '一等奖奖品'
    },
    {
      name: 'prize2',
      srcs: 'assets/img/prize-2.png',
      title: '二等奖',
      desc: '二等奖奖品'
    },
    {
      name: 'prize3',
      srcs: 'assets/img/prize-3.png',
      title: '三等奖',
      desc: '三等奖奖品'
    },
    {
      name: 'prize4',
      srcs: 'assets/img/prize-4.png',
      title: '四等奖',
      desc: '四等奖奖品'
    },
    {
      name: 'prize5',
      srcs: 'assets/img/prize-5.png',
      title: '五等奖',
      desc: '五等奖奖品'
    },
    {
      name: 'prize6',
      srcs: 'assets/img/prize-6.png',
      title: '六等奖',
      desc: '六等奖奖品'
    },
    {
      name: 'prize7',
      srcs: 'assets/img/prize-7.png',
      title: '七等奖',
      desc: '七等奖奖品'
    },
    {
      name: 'prize8',
      srcs: 'assets/img/prize-8.png',
      title: '八等奖',
      desc: '八等奖奖品'
    }
  ]
}
bgData = {
  name: 'bg',
  assets: [
    {
      name: 'mainBg',
      srcs: 'assets/img/bg.png',
    }
  ]
}
// End 请求接口获取对应数据赋值 

const manifest = {
  bundles: []
};
manifest.bundles = [...manifest.bundles, bgData, turntableData, actionsData, prizesData]

const Assets = PIXI.Assets
const Application = PIXI.Application
const Container = PIXI.Container
const Sprite = PIXI.Sprite

startup()

async function startup() {
  // 加载资源
  await Assets.init({ manifest })

  // 初始化应用
  const app = new Application({
    // width: window.innerWidth,
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    autoDensity: true,
    transparent: false,
    resolution: 1
  });
  app.stage.sortableChildren = true;
  baseData.app = app;

  // 新建分组-背景
  addBackground(app);

  // 新建分组-转盘
  const turntableLayer = addTurntable(app);
  const btnLauncher = turntableAction(app);

  Promise.all([turntableLayer, btnLauncher]).then((resArr) => {
    const [turntable, btnLauncher] = resArr

    btnLauncher.eventMode = 'static'
    btnLauncher.on("pointerdown", () => {
      if (baseConf.turnoff) {
        console.log('请耐心等待抽奖结果')
        return
      }

      btnLauncher.go(turntable)
    })
  })



  // 添加到页面
  document.body.appendChild(app.view);
  // Update the shared group
  app.ticker.add(() => TWEEDLE.Group.shared.update());
}

async function addBackground(ctx) {
  const ctn = new Container()
  ctn.sortableChildren = true;
  ctn.zIndex = 0;
  // 添加到场景
  ctx.stage.addChild(ctn)

  // 背景图
  const assetsBg = await Assets.loadBundle('bg')
  const mainBg = new Sprite(assetsBg.mainBg);
  mainBg.anchor.set(0, 0);
  mainBg.position.set(0, 0)
  mainBg.width = realDimension(mainBg.width);
  mainBg.height = realDimension(mainBg.height);

  // 添加元素到组
  ctn.addChild(mainBg)

  return ctn;
}

async function addTurntable(ctx) {
  const ctn = new Container()
  ctn.antialias = true;
  ctn.sortableChildren = true;
  ctn.zIndex = 10;
  ctn.pivot.set(0.5);
  // ctn.scale.set(0.5);
  // 添加到场景
  ctx.stage.addChild(ctn);

  // const turntableBg = PIXI.Sprite.from('turntable-border.png');
  const assetsPrize = await Assets.loadBundle('prizes')
  const assetsTurntable = await Assets.loadBundle('turntable')
  const tAssetsKey = Object.keys(assetsTurntable)
  const pAssetsKey = Object.keys(assetsPrize)

  // 绘制转盘
  tAssetsKey.map((key, i) => {
    if (!i) {
      // 默认第一个资源图片为转盘背景
      baseConf.axis = turntablePosition(assetsTurntable[key])

      ctn.position.set(baseConf.axis.x, baseConf.axis.y)
      // 绘制扇形, 拼接成盘面
      Object.keys(assetsPrize).map((key, j) => {
        if (j > baseConf.prizeCount) return

        const tmpSector = drawSectorOfCircle(ctn, 1, {
          x: 0,
          y: 0,
          radius: realDimension(baseConf.realTurntableRadius),
          startAngle: 0,
          endAngle: 360 / baseConf.prizeCount,
          color: baseConf.prizeCount % 2 ? baseConf.plateColor[0] : baseConf.plateColor[j % baseConf.plateColor.length]
        });

        tmpSector.rotation = baseData.circleAngle / baseConf.prizeCount * (j - 0.5)
        ctn.addChild(tmpSector)
      })
    }
    addSprite(ctn, assetsTurntable[key], i)
  })

  // 绘制奖品
  pAssetsKey.map((key, i) => {
    if (i >= baseConf.prizeCount) return

    const curPrizes = new Sprite(assetsPrize[key])
    // 待优化，奖品图片尺寸大小以设计稿宽度640为参照,取消缩放0.65倍
    curPrizes.width = realDimension(curPrizes.width) * 0.65;
    curPrizes.height = realDimension(curPrizes.height) * 0.65;
    curPrizes.anchor.set(0.5, 2.1)
    curPrizes.angle = (360 / baseConf.prizeCount) * i
    curPrizes.zIndex = 100;

    ctn.addChild(curPrizes)
  })

  return ctn;
}

/**
  * @param {string} container - 父容器
  * @param {number} zIndex - 绘制的图形在父容器内的层级
  * @param {Object} options - 绘制正圆扇形的参数
  * @param {number} options.x - 圆心 x 坐标
  * @param {number} options.y - 圆心 y 坐标
  * @param {number} options.radius - 圆半径
  * @param {number} options.angle - 角度
  * @param {string} options.color - 填充的色值，如：'0xffffff' -> 白色
  */
function drawSectorOfCircle(container, zIndex, {
  x = 0,
  y = 0,
  radius = 0,
  startAngle = 0,
  endAngle = 0,
  color = '0xffffff'
}) {

  const graphics = new PIXI.Graphics();

  graphics.beginFill(color);
  graphics.moveTo(x, y);
  // graphics.lineTo(x, y + radius);
  // 画弧
  // 角度转弧度的公式为：弧度 = 角度 * Math.PI / 180
  graphics.arc(x, y, radius, startAngle, endAngle * Math.PI / 180, false)
  // graphics.lineTo(x, y);
  graphics.closePath();
  graphics.endFill();

  graphics.zIndex = zIndex || 0;
  graphics.position.set(x, y)
  container.addChild(graphics);

  return graphics;
}

function addSprite(container, texture, zIndex) {
  const curSprite = new Sprite(texture);
  curSprite.width = realDimension(curSprite.width);
  curSprite.height = realDimension(curSprite.height);
  curSprite.anchor.set(0.5)
  curSprite.zIndex = zIndex || 0;

  container.addChild(curSprite)
}

// 固定转盘位置到画布
function turntablePosition(turntable) {
  const axisX = baseData.app.screen.width / 2
  const axisY = realDimension(baseConf.turntableMarginTop) + realDimension(turntable.height) / 2
  return { x: axisX, y: axisY }
}

// 根据尺寸计算出其在当前画布中的真实尺寸
function realDimension(dipd) {
  // dipd -> Device-independent pixels dimension
  return dipd / baseData.ratio;
}

// 抽奖
async function turntableAction(ctx) {
  const ctn = new Container()
  ctn.zIndex = 20;
  ctn.scale.set(0.5)
  // ctn.pivot.set(0.5)
  ctx.stage.addChild(ctn)

  const assetsAction = await Assets.loadBundle('actions')
  const btnLauncher = new Sprite(assetsAction.btnLauncher);
  btnLauncher.width = realDimension(btnLauncher.width);
  btnLauncher.height = realDimension(btnLauncher.height);
  btnLauncher.anchor.set(0.5)

  if (typeof baseConf.axis === 'undefined') {
    const assetsTurntable = await Assets.loadBundle('turntable')
    const axis = turntablePosition(assetsTurntable.turntableBg)
    ctn.position.set(axis.x, axis.y - 10)
  } else {
    ctn.position.set(baseConf.axis.x, baseConf.axis.y - 10)
  }
  ctn.addChild(btnLauncher)

  // Action "Go"
  ctn.go = function (turntable) {
    if (baseConf.turnMax <= baseConf.turnCount) {
      console.log('您的抽奖次数已用完')
      return;
    }

    // 抽奖进行中时，禁用抽奖按钮
    baseConf.turnoff = true
    // 记录抽奖次数
    baseConf.turnCount += 1;

    // Mock current prize
    const current = Math.floor(Math.random() * baseConf.prizeCount) || 0;
    const perDeg = baseData.circleAngle / (baseConf.prizeCount + 1)
    // wheel angle
    const curPrizeDeg = baseData.circleAngle - current * perDeg + baseData.circleAngle * baseData.laps * baseConf.turnCount;

    // console.log(current, curPrizeDeg)

    new TWEEDLE.Tween(turntable)
      .to({ rotation: curPrizeDeg }, baseConf.turnTime)
      .easing(TWEEDLE.Easing.Cubic.InOut)
      .start();

    // 等待转盘转动结束出结果
    t = setTimeout(async () => {
      clearTimeout(t)
      baseConf.turnoff = false

      if (!current) {
        console.log(
          `%c${prizesData.assets[current].title}\n%c${prizesData.assets[current].desc}`,
          'color:blue', 'color:black'
        )
      } else {
        console.log(
          `恭喜您抽中【%c${prizesData.assets[current].title}%c】\n奖品为“%c${prizesData.assets[current].desc}%c”`,
          'color:red', 'color:black', 'color:red', 'color:black'
        )
      }
    }, baseConf.turnTime + 20);
  }

  // Action "Stop"
  ctn.stop = function () {
    console.log('Stop')
  }

  return ctn;
}
