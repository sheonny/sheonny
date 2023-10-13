const calculateSphereCenter = () => {
    console.log(fitSphereInfo.pointPositions);
    if(fitSphereInfo.pointPositions.length !== 10 || fitSphereInfo.sphereActors.length) return;
    const points = [];
    for (let index = 0; index < fitSphereInfo.pointPositions.length; index++) {
      points.push(fitSphereInfo.pointPositions[index].position);
    };
    console.log(points);
    // sphereFit(points);
    const matrix = mat4.identity(new Float32Array(16));
    console.log(matrix);
    const int = mat4.identity(new Float32Array(4));
    const out = [0, 0, 0, 0];
    const num = fitSphereInfo.pointPositions.length;
    matrix[15] = num;
    for (let i = 0; i < num; i++) {
      const pos = fitSphereInfo.pointPositions[i].position;
      const temp = pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2];
      int[0] += pos[0] * temp;
      int[1] += pos[1] * temp;
      int[2] += pos[2] * temp;
      int[3] -= temp;
      matrix[0] += pos[0] * pos[0];
      matrix[1] += pos[0] * pos[1];
      matrix[2] += pos[0] * pos[2];
      matrix[3] -= pos[0];
      matrix[4] += pos[0] * pos[1];
      matrix[5] += pos[1] * pos[1];
      matrix[6] += pos[1] * pos[2];
      matrix[7] -= pos[1];
      matrix[8] += pos[0] * pos[2];
      matrix[9] += pos[1] * pos[2];
      matrix[10] += pos[2] * pos[2];
      matrix[11] -= pos[2];
      matrix[12] -= pos[0];
      matrix[13] -= pos[1];
      matrix[14] -= pos[2];
    }
    const newMatrixT = mat4.identity(new Float32Array(16));
    mat4.invert(newMatrixT, matrix);
    for (let i = 0; i < 4; i++) {
          out[0] += newMatrixT[i] * int[i];
          out[1] += newMatrixT[4 + i] * int[i];
          out[2] += newMatrixT[8 + i] * int[i];
          out[3] += newMatrixT[12 + i] * int[i];
        }
    out[0] *= 0.5;
    out[1] *= 0.5;
    out[2] *= 0.5;
    out[3] = Math.pow(out[0] * out[0] + out[1] * out[1] + out[2] * out[2] - out[3], 0.5);
    const point = {
      position: [out[0], out[1], out[2]]
    };
    fitSphereInfo.sphereRadirs = out[3];
    fitSphereInfo.sphereActors.push(createPoint(point, threeView.renderer, "fit", out[3]));
    threeView.renderWindow.render();
    threeView.interactor.getInteractorStyle().setEnabled(true);
  };
  
  const removeFit = () => {
    console.log(fitSphereInfo.pointActors);
    [...fitSphereInfo.pointActors, ...fitSphereInfo.sphereActors].forEach(actor => {
      threeView.renderer.removeActor(actor);
    });
    fitSphereInfo.pointPositions = [];
    fitSphereInfo.pointActors = [];
    fitSphereInfo.sphereActors = [];
    threeView.renderWindow.render();
  };
  
  // // eslint-disable-next-line no-unused-vars
  // const matlabFit = () => {
  //   const points = [];
  //   fitSphereInfo.pointPositions.map(item => points.push(...item.position));
  //   const length = points.length;
  //   const arr = new Array(18).fill(0);
  //   const pow = Math.pow;
  //   let [xAvr, yAvr, zAvr, xxAvr, yyAvr, zzAvr, xyAvr, xzAvr, yzAvr, xxxAvr, xxyAvr, xxzAvr, xyyAvr, xzzAvr, yyyAvr, yyzAvr, yzzAvr, zzzAvr] = arr;
  //   for (let i = 0; i < length; i += 3) {
  //     xAvr += points[i];
  //     yAvr += points[i + 1];
  //     zAvr += points[i + 2];
  //     xxAvr += pow(points[i], 2);
  //     yyAvr += pow(points[i + 1], 2);
  //     zzAvr += pow(points[i + 2], 2);
  //     xyAvr += points[i] * points[i + 1];
  //     xzAvr += points[i] * points[i + 2];
  //     yzAvr += points[i + 1] * points[i + 2];
  //     xxxAvr += pow(points[i], 3);
  //     xxyAvr += pow(points[i], 2) * points[i + 1];
  //     xxzAvr += pow(points[i], 2) * points[i + 2];
  //     xyyAvr += points[i] * pow(points[i + 1], 2);
  //     xzzAvr += points[i] * pow(points[i + 2], 2);
  //     yyyAvr += pow(points[i + 1], 3);
  //     yyzAvr += pow(points[i + 1], 2) * points[i + 2];
  //     yzzAvr += points[i + 1] * pow(points[i + 2], 2);
  //     zzzAvr += pow(points[i + 2], 3);
  //   }
  //   [xAvr, yAvr, zAvr, xxAvr, yyAvr, zzAvr, xyAvr, xzAvr, yzAvr, xxxAvr, xxyAvr, xxzAvr, xyyAvr, xzzAvr, yyyAvr, yyzAvr, yzzAvr, zzzAvr].map(item => {
  //     item = item / length;
  //     return item;
  //   });
  //  const A = [xxAvr - xAvr * xAvr, xyAvr - xAvr * yAvr, xzAvr - xAvr * zAvr,
  //       xyAvr - xAvr * yAvr, yyAvr - yAvr * yAvr, yzAvr - yAvr * zAvr,
  //       xzAvr - xAvr * zAvr, yzAvr - yAvr * zAvr, zzAvr - zAvr * zAvr];
  //  let b = [xxxAvr - xAvr * xxAvr + xyyAvr - xAvr * yyAvr + xzzAvr - xAvr * zzAvr,
  //       xxyAvr - yAvr * xxAvr + yyyAvr - yAvr * yyAvr + yzzAvr - yAvr * zzAvr,
  //       xxzAvr - zAvr * xxAvr + yyzAvr - zAvr * yyAvr + zzzAvr - zAvr * zzAvr];
  //   b = b.map(item => item / 2);
  //  const matrix = mat3.identity(new Float32Array(9));
  //  mat3.invert(matrix, mat3.fromValues(...A));
  //  console.log(matrix, vec3.fromValues(...b));
  //  const resoult = vec3.create();
  //  vec3.transformMat3(resoult, vec3.fromValues(...b), matrix);
  //  const [x, y, z] = [resoult[0], resoult[1], resoult[2]];
  //  const point = {
  //     position: [resoult[0], resoult[1], resoult[2]]
  //   };
  // console.log(resoult);
  // const r = Math.pow(xxAvr - 2 * x * xAvr + x * x + yyAvr - 2 * y * yAvr + y * y + zzAvr - 2 * z * zAvr + z * z, 0.5);
  // fitSphereInfo.sphereRadirs = r;
  // fitSphereInfo.sphereActors.push(createPoint(point, threeView.renderer, "fit", r));
  // threeView.renderWindow.render();
  // };
  
  // // eslint-disable-next-line no-unused-vars
  // const sphereFit = (points) => {
  //   const Y = [0, 0, 0, 0]; const MTX = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  //   const matrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  //   const matrix2 = [];
  //   const IMTX = mat4.identity(new Float32Array(16));
  //   const fac = [0, 0, 0, 0];
  //   const pow = Math.pow;
  //     for (let i = 0; i < points.length; i++) {
  //         Y[0] += pow(points[i][0], 3) + pow(points[i][1], 2) * points[i][0] + pow(points[i][2], 2) * points[i][0];
  //         Y[1] += pow(points[i][1], 3) + pow(points[i][0], 2) * points[i][1] + pow(points[i][2], 2) * points[i][1];
  //         Y[2] += pow(points[i][2], 3) + pow(points[i][0], 2) * points[i][2] + pow(points[i][1], 2) * points[i][2];
  //         Y[3] -= pow(points[i][0], 2) + pow(points[i][1], 2) + pow(points[i][2], 2);
  //     }
  //     console.log(Y);
  //     for (let j = 0; j < points.length; j++) {
  //         MTX[0][0] += pow(points[j][0], 2);
  //         MTX[0][1] += points[j][0] * points[j][1];
  //         MTX[0][2] += points[j][0] * points[j][2];
  //         MTX[0][3] -= points[j][0];
  //         MTX[1][1] += pow(points[j][1], 2);
  //         MTX[1][2] += points[j][1] * points[j][2];
  //         MTX[1][3] -= points[j][1];
  //         MTX[2][2] += pow(points[j][2], 2);
  //         MTX[2][3] -= points[j][2];
  //     }
  //     MTX[1][0] = MTX[0][1];
  //     MTX[2][0] = MTX[0][2];
  //     MTX[2][1] = MTX[1][2];
  //     MTX[3][0] = MTX[0][3];
  //     MTX[3][1] = MTX[1][3];
  //     MTX[3][2] = MTX[2][3];
  //     MTX[3][3] = 10.0;
  //     console.log(MTX);
  //     for (let i = 0; i < 4; i++) {
  //       for (let j = 0; j < 4; j++) {
  //         matrix[i][j] = MTX[i][j]; // 标注区别
  //       }
  //     }
  //     const arr = [];
  //     for (let index = 0; index < matrix.length; index++) {
  //       arr.push(...matrix[index]);
  //     }
  //     console.log(arr);
  //     const mat41 = mat4.fromValues(...arr);
  //     mat4.invert(matrix2, mat41);
  //     console.log(matrix2, matrix);
  //     //  for (let i = 0; i < 4; i++) {
  //     //   for (let j = 0; j < 4; j++) {
  //     //     IMTX[i][j] = matrix2[i + j]; // 标注区别
  //     //   }
  //     // }
  //      mat4.copy(IMTX, matrix2);
  //      console.log(IMTX, Y);
  //      for (let i = 0; i < 4; i++) {
  //           fac[0] += IMTX[i] * Y[i];
  //           fac[1] += IMTX[4 + i] * Y[i];
  //           fac[2] += IMTX[8 + i] * Y[i];
  //           fac[3] += IMTX[12 + i] * Y[i];
  //         }
  //     const R = pow(fac[0] / 2.0, 2) + pow(fac[1] / 2.0, 2) + pow(fac[2] / 2.0, 2) - fac[3];
  //     console.log(fac);
  //     console.log(fac[0] / 2);
  //     console.log(fac[1] / 2);
  //     console.log(fac[2] / 2);
  //     console.log(fac[3] / 2);
  //     console.log(pow(R, 0.5));
  //      const point = {
  //     position: [fac[0], fac[1], fac[2]]
  //   };
  //   fitSphereInfo.currentStatus = 1;
  //   fitSphereInfo.sphereRadirs = pow(R, 0.5);
  //   createPoint(point, threeView.renderer, "fit", pow(R, 0.5));
  //   threeView.renderWindow.render();
  // };