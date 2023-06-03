const initData = {
  dpr: window.devicePixelRatio,
  // 640 为设计稿默认宽度（像素）
  ratio: 640 / window.innerWidth,
  // 默认转5圈
  laps: 5,
}

// 可根据接口请求赋值以下数据
const baseConf = {
  drawTime: 2000,
  turnoff: false,
  // 有效抽奖次数，可抽奖次数上限
  drawMax: 2,
  // 当前已抽奖次数
  drawCount: 0,
  // 设置奖品数（含“谢谢参与”）
  prizesCount: 8
}

const manifest = {
  bundles: []
};
// 素材资源
let actionsData = {}
let prizesData = {}
let bgData = {}

manifest.bundles = [...manifest.bundles, bgData, actionsData, prizesData]

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
  initData.app = app;
}
