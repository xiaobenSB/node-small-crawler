var https = require('https'),
    request = require('request'),
    cheerio = require('cheerio'),
    path = require('path'),
    fs = require('fs'),
    // ,url = 'https://www.zhihu.com/question/35846840'; 汉服
    // ,url = 'https://www.zhihu.com/question/37709992'; // 长得好看
    // ,url = 'https://www.zhihu.com/question/33644719'; // 校花
    // ,url = 'https://www.zhihu.com/question/34243513'; // 你见过最漂亮的女生长什么样？
    // ,url = 'https://www.zhihu.com/question/34078228'; // 发一张你认为很漂亮的美女照片
    defaultUrl = 'https://www.zhihu.com/question/34078228'; // 发一张你认为很漂亮的美女照片
    url = process.argv[2];

let app = {
  init (url) {
    this.filePath = this.generateFilePath(this.parseFileName(url));
    this.getAllHtml(url, this.filterHtml);
  },
  getAllHtml (url, callback) {
    let sHtml = '',
        _this = this;
    https.get(url, (res) => {
      res.on('data', (data) => {
        sHtml += data;
      });
      res.on('end', () => {
        callback.bind(_this, sHtml)();
      })
    }).on('error', (err) => {
      console.log(err);
    });
  },
  filterHtml (sHtml, filePath) {
    let $ = cheerio.load(sHtml),
        $Imgs = $('noscript img'), //根据爬取网页的DOM结构爬取想要东西
        imgData = [],
        _this = this;
        
      $Imgs.each((i, e) => {
        let imgUrl = $(e).attr('src');

        imgData.push(imgUrl);
        _this.downloadImg(imgUrl, _this.filePath, function (err) {
          console.log(imgUrl + 'has be down');
        });
      });
      console.log(imgData);
  },
  parseFileName (fileName) {
    return path.basename(fileName);//过滤/前面的字符,如:http:/x/x/1.png取1.png
  },
  generateFilePath (path) {
    if (fs.existsSync(path)) {
      console.log(path + '目录已经存在');
    } else {
      fs.mkdirSync(path);
      console.log(path + '目录创建成功');
    }
    return path;
  },
  downloadImg (imgUrl, filePath, callback) {
    let fileName = this.parseFileName(imgUrl);
    request(imgUrl).pipe(fs.createWriteStream('./' + filePath + '/'+fileName)).on('close', callback && callback);
  }
};
//request可以用于请求图片地址让它返回图片格式的数据（如同我们电脑记事本，我们往里面加记事本格式的东西然后计算本就会把写入东西的数据然后显示）
//（如同记事本写入的数据）来导进我们命名的图片格式来显示，注意第一个参数得是url,然后request(url)返回的是可读流所以pipe
app.init(url || defaultUrl);

