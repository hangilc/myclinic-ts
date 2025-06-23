<script lang="ts">
  export let src: string;
  export let onImageLoaded: () => void;

  let wrapperElement: HTMLDivElement;
  let imgElement: HTMLImageElement;
  let scale = 1;
  let rotate = 0;
  let naturalWidth: number = 0;
  let naturalHeight: number = 0;

  function imgStyle(): string {
    if (rotate === 0) {
      return `transform:translate(0,0) scale(${scale})`;
    } else if (rotate === 90) {
      return `transform:translate(0,0) scale(${scale}) rotate(90deg) translate(0, -100%)`;
    } else if (rotate === 180) {
      return `transform:translate(0,0) scale(${scale}) rotate(180deg) translate(-100%, -100%)`;
    } else if (rotate === 270) {
      return `transform:translate(0,0) scale(${scale}) rotate(270deg) translate(-100%, 0`;
    } else {
      console.error(`unhandled rotate ${rotate}`);
      return "";
    }
  }

  export const setWidth: (width: number) => void = (width) => {
	scale = width / naturalWidth;
	update();
  };

  function update() {
    if (imgElement && wrapperElement) {
      imgElement.setAttribute("style", imgStyle());
      if (rotate % 180 === 0) {
        wrapperElement.style.width = `${naturalWidth * scale}px`;
        wrapperElement.style.height = `${naturalHeight * scale}px`;
      } else {
        wrapperElement.style.width = `${naturalHeight * scale}px`;
        wrapperElement.style.height = `${naturalWidth * scale}px`;
	  }
    }
  }

  export const enlarge: (amount: number) => void = (amount) => {
    scale *= amount;
    update();
  };

  function rotateBy(amount: number) {
    rotate = (rotate + amount) % 360;
    update();
  }

  export const rotateRight: () => void = () => {
    rotateBy(90);
  };

  export const rotateLeft: () => void = () => {
    rotateBy(-90);
  };

  function onImgLoaded() {
    if (wrapperElement && imgElement) {
      naturalWidth = imgElement.naturalWidth;
      naturalHeight = imgElement.naturalHeight;
      wrapperElement.style.width = `${naturalWidth}px`;
      wrapperElement.style.height = `${naturalHeight}px`;
      onImageLoaded();
    }
  }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<div bind:this={wrapperElement} class="wrapper">
  <img {src} bind:this={imgElement} on:load={onImgLoaded} />
</div>

<style>
  .wrapper {
    position: relative;
  }

  .wrapper img {
    position: absolute;
    left: 0;
    top: 0;
  }
</style>

