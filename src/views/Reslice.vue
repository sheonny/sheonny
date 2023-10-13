<template>
  <div class="wrap">
    <div ref="vtkContainer" class="vtkContainer"></div>
    <div class="sliceWrap">
      <div ref="sliceI"></div>
      <div ref="sliceJ"></div>
      <div ref="sliceK" style="position: relative"></div>
    </div>
  </div>
</template>
<script setup>
import '@kitware/vtk.js/Rendering/Profiles/All'
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow'
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor'
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper'
import vtkSTLReader from '@kitware/vtk.js/IO/Geometry/STLReader'
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray'
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice'
import vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice'
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper'
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper'
import * as itk from 'itk-wasm'
import vtkLiteHttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper'
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage'
import { ref, onMounted, reactive } from 'vue'
import { mat4 } from 'gl-matrix'

import vtkPixelSpaceCallbackMapper from '@kitware/vtk.js/Rendering/Core/PixelSpaceCallbackMapper';
import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';

import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import { FieldAssociations } from "@kitware/vtk.js/Common/DataModel/DataSet/Constants";
import { throttle } from "@kitware/vtk.js/macros";
import vtkActor2D from "@kitware/vtk.js/Rendering/Core/Actor2D";
import vtkMapper2D from "@kitware/vtk.js/Rendering/Core/Mapper2D";
import vtkCoordinate from "@kitware/vtk.js/Rendering/Core/Coordinate";
import CrossDotSource from "./createCross2D.js";
const vtkContainer = ref(null)
const myRenterer= ref(null)
const sliceI = ref(null)
const sliceJ = ref(null)
const sliceK = ref(null)
const slide = ref(null)
let vtkImageInfo = reactive({})
const sliderArray = reactive([
  { title: '左髋骨', value: 'leftHip', color: [255, 255, 255], url: './stl/leftHip.stl' },
  { title: '右髋骨', value: 'rightHip', color: [255, 255, 255], url: './stl/rightHip.stl' },
  { title: '右股骨', value: 'rightFemur', color: [0, 255, 0], url: './stl/cup.stl' }
])

const initView = async (stop = false, otherContainer = null) => {
  console.log(stop, otherContainer);
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    rootContainer: otherContainer || vtkContainer.value,
    background: [0, 0, 0, 0.5]
  })
  const renderer = fullScreenRenderer.getRenderer()
  const renderWindow = fullScreenRenderer.getRenderWindow()
  const camera = renderer.getActiveCamera()
  camera.elevation(90)
  for (let i = 0; i < sliderArray.length; i++) {
    await setActor(sliderArray[i], renderer)
  }
  renderer.setActiveCamera(camera)
  renderer.resetCamera()
  myRenterer.value = fullScreenRenderer;
  console.log(fullScreenRenderer.getContainer());
  // if (stop) return;
  renderWindow.render()
}
const setActor = async (data, renderer) => {
  const { url, pose, color } = data
  const reader = vtkSTLReader.newInstance({ binary: true })
  await reader.setUrl(url)
  const actor = vtkActor.newInstance({ pickable: false })
  const mapper = vtkMapper.newInstance()
  actor.getProperty().setOpacity(0.5)
  actor.setMapper(mapper)
  mapper.setInputConnection(reader.getOutputPort())
  renderer.addActor(actor)
  setScalarsColor(actor, color)
  const bounds = reader.getOutputData().getBounds()
  const center = [
    (bounds[0] + bounds[1]) / 2,
    (bounds[2] + bounds[3]) / 2,
    (bounds[4] + bounds[5]) / 2
  ]
  return { mapper, actor, reader, pose, center }
}

/**
 * 设置stl颜色
 * @param {*} actor
 * @param {*} color
 */
function setScalarsColor(actor, color = [255, 255, 255]) {
  const xyz = actor.getMapper().getInputData().getPoints().getData()
  console.log(xyz)
  const rgb = new Uint8Array(xyz.length)
  for (let i = 0; i < rgb.length; i += 3) {
    rgb[i + 2] = color[2]
    rgb[i + 1] = color[1]
    rgb[i + 0] = color[0]
  }

  actor
    .getMapper()
    .getInputData()
    .getPointData()
    .setScalars(
      vtkDataArray.newInstance({
        name: 'rgb',
        numberOfComponents: 3,
        values: rgb
      })
    )
  // actor.modified();
}
const initSliceView = async () => {
  const sliceObj = {
    setISlice: 'sliderI',
    setJSlice: 'sliderJ',
    setKSlice: 'sliderK'
  }

  const fullScreenRenderer = vtkGenericRenderWindow.newInstance({
    rootContainer: sliceK.value,
    background: [0, 0, 0]
  })
  fullScreenRenderer.setContainer(sliceK.value);
  fullScreenRenderer.resize();
  const renderer = fullScreenRenderer.getRenderer()
  renderer.getActiveCamera().setParallelProjection(true);
  const renderWindow = fullScreenRenderer.getRenderWindow()
  renderWindow.addView(fullScreenRenderer.getOpenGLRenderWindow());
  // renderWindow.setInteractor(fullScreenRenderer.getInteractor());
  // fullScreenRenderer.getInteractor().setView(fullScreenRenderer.getOpenGLRenderWindow());
  renderWindow.getInteractor().initialize();
  // fullScreenRenderer.getInteractor().bindEvents(sliceK.value);
  // fullScreenRenderer.getInteractor().setInteractorStyle(vtkInteractorStyleImage.newInstance());
  const SlicerInteractor = renderWindow.getInteractor();
  const SlicerApiSpecificRenderWindow = SlicerInteractor.getView();
  const SlicerHardwareSelector = SlicerApiSpecificRenderWindow.getSelector();
  // SlicerHardwareSelector.setCaptureZValues(true);
  // SlicerHardwareSelector.setFieldAssociation(FieldAssociations.FIELD_ASSOCIATION_CELLS);
  const slicerMapper = vtkImageMapper.newInstance()
  const slicerActor = vtkImageSlice.newInstance()
  const reslice = vtkImageReslice.newInstance()
  const axes = mat4.identity(new Float32Array(16))
  // renderer.getActiveCamera().setParallelProjection(true)
  const volumeArrayBuffer = await vtkLiteHttpDataAccessHelper.fetchBinary('./files/test.nrrd')
  const { image: itkImage, webWorker } = await itk.readImageArrayBuffer(
    null,
    volumeArrayBuffer,
    'test.nrrd'
  )
  webWorker.terminate()
  const vtkImage = vtkITKHelper.convertItkToVtkImage(itkImage)
  vtkImageInfo.Origin = vtkImage.getOrigin()
  vtkImageInfo.Spacing = vtkImage.getSpacing()
  vtkImageInfo.Extent = vtkImage.getExtent()
  vtkImageInfo.Direction = vtkImage.getDirection()
  // const vtkImageBounds = [];
  console.log(vtkImageInfo)
  const a = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]
  for (let i = 0; i < 12; i++) {
    axes[i] = a[i]
  }
  // mat4.rotateX(axes, axes,Math.PI )
  slide.value = Math.round(vtkImageInfo.Extent[5] / 2)
  // let position=vtkImageInfo.Origin[2] + (vtkImageInfo.Extent[5]-slide.value) * vtkImageInfo.Spacing[2]*vtkImageInfo.axesDirection[2]
  const position = vtkImageInfo.Origin[2] + slide.value * vtkImageInfo.Spacing[2]
  axes[14] = position + 200
  console.log('setKSlice********************************', axes)
  function SlicerManageSphere (event){
    const [x, y] = eventToWindowXY(event, SlicerApiSpecificRenderWindow, sliceK.value);
    SlicerHardwareSelector.getSourceDataAsync(renderer, x, y, x, y).then((result) => {
       if(result) {
          const selections = result.generateSelection(x, y, x, y);
          console.log(selections);
          // if(!selections || selections.length === 0) {
            
          // } else {
            
          // }
          renderWindow.render();
        }
    })
  }
  
  const SlicerThrottleManageSphere = throttle(SlicerManageSphere, 15);
  sliceK.value.addEventListener("mousemove", SlicerThrottleManageSphere);
  const sphere = CrossDotSource.newInstance({scale: 50});
    // sphere.setRadius(50);
    // sphere.setThetaResolution(80);
    const sphereMapper = vtkMapper2D.newInstance();
    sphereMapper.setInputConnection(sphere.getOutputPort());
    const sphereActor = vtkActor2D.newInstance();
    sphereActor.setMapper(sphereMapper);
     const c = vtkCoordinate.newInstance();
    c.setCoordinateSystemToWorld();
    sphereMapper.setTransformCoordinate(c);
    sphereActor.getProperty().setColor(0.1, 0.1, 0.8);
    sphereActor.setVisibility(true);
    sphereActor.setPickable(false);

  reslice.setInputData(vtkImage)
  reslice.setOutputDimensionality(2)
  reslice.setResliceAxes(axes)
  // console.log("2222",reslice)
  // console.log(reslice.getOutputOrigin())
  slicerMapper.setInputData(reslice.getOutputData())
  slicerActor.setMapper(slicerMapper)

const textCanvas = document.createElement('canvas');
 textCanvas.setAttribute("width", 272);
  textCanvas.setAttribute("height", 279);
  textCanvas.style.width = "100%";
  textCanvas.style.display = "block";
  textCanvas.style.position = "absolute";
  sliceK.value.appendChild(textCanvas);

const textCtx = textCanvas.getContext('2d');
const psMapper = vtkPixelSpaceCallbackMapper.newInstance();
psMapper.setInputConnection(reslice.getOutputPort());
psMapper.setCallback(() => {
  if (textCtx) {
    textCtx.clearRect(0, 0, 272, 279);
      textCtx.font = '12px serif';
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'middle';
       textCtx.fillStyle = "#fff";
      textCtx.fillText(`aaaa`, 100, 100);

  }
});
  const callbackActor = vtkActor.newInstance();
  callbackActor.setMapper(psMapper);
  psMapper.setInputConnection(sphere.getOutputPort())

  renderer.addActor(sphereActor)
  renderer.addActor(callbackActor)
  renderer.addActor(slicerActor)
  renderer.resetCamera()
  renderWindow.render()
}
function eventToWindowXY(event, apiSpecificRenderWindow, domObj) {
  const { offsetX, offsetY } = event;
  const [width, height] = apiSpecificRenderWindow.getSize();
  const x = Math.round((width * offsetX) / domObj.offsetWidth);
  const y = Math.round(height * (1 - offsetY / domObj.offsetHeight)); // Need to flip Y
  return [x, y];
}

onMounted(async () => {
  console.log(vtkContainer)
  await initView()
  await initSliceView()
  findMedianSortedArrays([1, 2],[3, 4])
})
var findMedianSortedArrays = function(nums1, nums2) {
    const arr = [...nums1,nums2].sort((a,b)=> a - b)
    const length = arr.length
    console.log(arr, length);
    if(length % 2 === 0){
        return (arr[length / 2 - 1] + arr[length / 2]) / 2
    }else{
        return arr[(length - 1) / 2 ]
    }
};
</script>
<style lang="css">
/*body{*/
/*  width: 100vw;*/
/*  height: 100vh;*/
/*}*/
.wrap {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
}
.vtkContainer {
  width: 80%;
}
.sliceWrap {
  width: 20%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.sliceWrap div {
  flex: 1;
}
</style>
