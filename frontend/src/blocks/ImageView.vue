<template>
    <div class="flex justify-center">
        <Drawer v-model:visible="visible"
                style="background: 'red'"
                position="full">
            <template #header>
                <div class="flex grow gap-3 justify-center pl-10">
                    <div class="text-center">
                        <div class="font-bold text-lg">{{ curr_image?.title }}</div>
                        <div class="text-muted-color">{{ curr_image?.width }} x {{ curr_image?.height }} px</div>
                    </div>
                </div>
            </template>
            <div class="h-full">
                <swiper @swiper="onReady"
                        :style="{
                            '--swiper-navigation-color': '#fff',
                            '--swiper-pagination-color': '#fff',
                        }"
                        :zoom="{ enabled: true }"
                        :navigation="true"
                        class="w-full h-full"
                        :modules="modules"
                        @slide-change="onSlideChange"
                        :space-between="50">
                    <swiper-slide v-for="item in current_images">
                        <div class="swiper-zoom-container"
                             @wheel="onMouseWheel">
                            <img :src="item.src"
                                 @load="onImgLoad($event, item)" />
                        </div>
                    </swiper-slide>
                </swiper>
            </div>
        </Drawer>
    </div>
</template>
<script setup lang="ts">
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

import Drawer from 'primevue/drawer';
import { Zoom, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { ImageView, useImageView } from '../composables/useImageView';
import type { Swiper as SwiperInstance } from 'swiper/types';
import { ref } from 'vue';

const { visible, current_images } = useImageView();

let sw: SwiperInstance | undefined;

const modules = [Zoom, Navigation];
const curr_image = ref<ImageView>();

function onReady(instance: SwiperInstance) {
    sw = instance;
    curr_image.value = current_images.value.at(sw.activeIndex || 0);
}

function onSlideChange() {
    curr_image.value = current_images.value.at(sw?.activeIndex || 0);
}

function onImgLoad(e: Event, item: ImageView) {
    const img = e.target as HTMLImageElement;
    item.width = img.naturalWidth;
    item.height = img.naturalHeight;
}

function onMouseWheel(e: WheelEvent) {
    const curr_zoom = sw?.zoom.scale || 1;
    const speed = 1.2;

    if (e.deltaY < 0) {
        sw?.zoom.in(curr_zoom * speed);
    } else {
        sw?.zoom.in(curr_zoom / speed);
    }
}
</script>
