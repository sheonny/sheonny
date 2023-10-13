<template>
  <div class="sphere" ref="sphereBox">
      <span>333333</span>
    <!-- <h1>This is an about page</h1> -->
  </div>
</template>
<script setup>
import '@kitware/vtk.js/favicon';
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import { onMounted, ref} from 'vue'

import vtkPixelSpaceCallbackMapper from '@kitware/vtk.js/Rendering/Core/PixelSpaceCallbackMapper';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';

import vtkActor2D from "@kitware/vtk.js/Rendering/Core/Actor2D";
import vtkMapper2D from "@kitware/vtk.js/Rendering/Core/Mapper2D";
import vtkCoordinate from "@kitware/vtk.js/Rendering/Core/Coordinate";
import CrossDotSource from "./createCross2D.js";
// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------
const sphereBox = ref(null)
const initsphere = () => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        container:sphereBox.value,
        background: [0, 0, 0],
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    // ----------------------------------------------------------------------------
    // Example code
    // ----------------------------------------------------------------------------

    const sphereSource = CrossDotSource.newInstance({scale: 10});
    // sphereSource.setRadius(3);
    sphereSource.setCenter([0,0,0])
    const actor = vtkActor2D.newInstance();
    const mapper = vtkMapper2D.newInstance();
    // actor.getProperty().setEdgeVisibility(true);
    const c = vtkCoordinate.newInstance();
    c.setCoordinateSystemToWorld();
    mapper.setTransformCoordinate(c);
    mapper.setScalarVisibility(false);
    mapper.setInputConnection(sphereSource.getOutputPort());
    actor.setMapper(mapper);
    console.log(actor);
     actor.getProperty().setColor(113 / 255,243 / 255 ,253 / 255);
    console.log(renderWindow.getViews()[0].getSize());
    const [width,height] = renderWindow.getViews()[0].getSize()
    const textCanvas = document.createElement('canvas')
    const textCtx = textCanvas.getContext('2d');
    textCanvas.setAttribute('width', width);
    textCanvas.setAttribute('height', height);
    const psMapper = vtkPixelSpaceCallbackMapper.newInstance();
    psMapper.setInputData(sphereSource.getOutputData());
    psMapper.setUseZValues(true);
    psMapper.setCallback((coordsList) => {
        const xy = psMapper.getCenter()
        console.log(xy);
        textCtx.clearRect(0, 0, width, height);
        textCtx.font = '12px serif';
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        textCtx.fillStyle = "rgb(255,0,0)"
        textCtx.fillText(`哈哈哈`, coordsList[0][0], height - coordsList[0][1]);
    })
    const textActor = vtkActor.newInstance();
    textActor.setMapper(psMapper);

   
    //   const [x, y, z] = item.source.getCenter();
    //  const [xx, yy] = renderWindow.getInteractor().getInteractorStyle().computeWorldToDisplay(renderer, x, y, z);
    //  console.log(xx, yy);
    
    sphereBox.value.appendChild(textCanvas)

    const Interactor = renderWindow.getInteractor();
    Interactor.initialize();
    Interactor.bindEvents(textCanvas);
    Interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
    Interactor.getInteractorStyle().setEnabled(false);
    renderer.addActor(actor);
    renderer.addActor(textActor);
    renderer.resetCamera();
    renderWindow.render();
  }
  onMounted(() => {
    initsphere()
  })
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
  .sphere{
      width:500px;
      height: 500px;
  }
}
</style>
