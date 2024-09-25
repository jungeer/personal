// 获取所有匹配指定路径的图片文件
const imagePaths = import.meta.glob("@/images/photos/*.{png,jpg,jpeg,svg}");

export async function getImageInfo(callback) {
  const imageInfoArray = [];

  const imageLoadPromises = [];

  for (const path in imagePaths) {
    const promise = new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      img.onload = function () {
        canvas.width = this.width;
        canvas.height = this.height;
        context.drawImage(img, 0, 0, this.width, this.height);

        const imageData = context.getImageData(
          0,
          0,
          this.width,
          this.height
        ).data;
        const colorCount = {};
        let maxColor = "";
        let maxCount = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          const rgba =
            "rgba(" +
            imageData[i] +
            "," +
            imageData[i + 1] +
            "," +
            imageData[i + 2] +
            ", .5)";
          if (rgba in colorCount) {
            colorCount[rgba]++;
          } else {
            colorCount[rgba] = 1;
          }
          if (colorCount[rgba] > maxCount) {
            maxColor = rgba;
            maxCount = colorCount[rgba];
          }
        }

        const imageInfo = {
          src: path,
          width: img.width,
          height: img.height,
          color: maxColor,
        };

        imageInfoArray.push(imageInfo);
        resolve();
      };

      img.src = path;
    });

    imageLoadPromises.push(promise);
  }

  let handleImageInfo = callback;

  // 等待所有图片加载完成
  await Promise.all(imageLoadPromises).then(() => {
    // 所有图片加载完成后，执行回调函数，并将图片信息数组作为参数传递出去
    handleImageInfo(imageInfoArray);
  });
}
