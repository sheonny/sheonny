<template>
  <div class="about">
    <div style="width:100vw;height:100vh;background:#fff">

    </div>
    <h1>This is an about page</h1>
    <div ref="orther" style="width:500px;height:500px;position: absolute;z-index: -1" >

    </div>
  </div>
</template>
<script>
  import axios from 'axios'
  import { onMounted, ref} from 'vue'
  import '@kitware/vtk.js/favicon';
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
// import vtkActor2D from "@kitware/vtk.js/Rendering/Core/Actor2D";
// import vtkMapper2D from "@kitware/vtk.js/Rendering/Core/Mapper2D";
// import vtkCoordinate from "@kitware/vtk.js/Rendering/Core/Coordinate";
import Reslice from "./Reslice.vue"
console.log(Reslice.setup);
import { useRouter } from "vue-router";
import CrossDotSource from "./createCross2D.js";
  
  export default {
    
    setup(props, context){
      const orther = ref(null)
      const router = useRouter()
       onMounted(() => {
         console.log(orther);
  //   axios.get('/api/file').then(res => {
  //   console.log(res);

   
  // })
  //  initPolyData()
   const aaa = router.currentRoute.value.matched[0].children[0].component();
    let bbb;
    aaa.then(async res => {
        bbb = res.default.setup(props, context)
        console.log(bbb, orther.value);
        await bbb.initView(true,orther.value);
        console.log(bbb.myRenterer);
        const canvas = bbb.myRenterer.value.getContainer().childNodes[0];
        var MIME_TYPE = "image/png";
        var imgURL = canvas.toDataURL(MIME_TYPE);
        var dlLink = document.createElement('a');
        dlLink.download = "aaa";
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        // bbb.myRenterer.value.getContainer().childNode()
        // await bbb.initSliceView(true)
        // bbb.findMedianSortedArrays([1, 2],[3, 4])
        //   bbb.onMounted((async () => {
        
        // }))
    });
  })
 ;

  function initPolyData() {
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const Source = CrossDotSource.newInstance({scale: 50, normal: [1,0,0]})
const resetCamera = renderer.resetCamera;
const render = renderWindow.render;
const mapper = vtkMapper.newInstance();
  const actor = vtkActor.newInstance();
  console.log(actor);
  actor.setMapper(mapper);
  actor.getProperty().setLineWidth(5)
  console.log(Source);
  mapper.setInputData(Source.getOutputData());
  actor.getProperty().setColor(113 / 255,243 / 255 ,253 / 255);
  actor.setPickable(false);
  const camera = renderer.getActiveCamera();
  // renderWindow.getInteractor().getInteractorStyle().setEnabled(false);
  renderer.addActor(actor);
  camera.setDistance(1000)

  resetCamera();
  render();
  }
  return {
    orther
  }
    }
  }
 
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
