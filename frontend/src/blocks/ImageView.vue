<template>
    <div class="flex justify-center">
        <Drawer
            v-model:visible="visible"
            style="background: 'red'"
            :header="current_images[0]?.title"
            position="full"
        >
            <div class="h-full">
                <swiper
                    @swiper="(v) => (sw = v)"
                    :style="{
                        '--swiper-navigation-color': '#fff',
                        '--swiper-pagination-color': '#fff',
                    }"
                    :zoom="{ enabled: true }"
                    :navigation="true"
                    class="w-full h-full"
                    :modules="modules"
                    :space-between="50"
                >
                    <swiper-slide v-for="item in current_images">
                        <div
                            class="swiper-zoom-container"
                            @wheel="onMouseWheel"
                        >
                            <img :src="item.src" />
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
import { useImageView } from '../composables/useImageView';
import { Swiper as SwiperInstance } from 'swiper/types';

const { visible, current_images } = useImageView();

let sw: SwiperInstance | undefined;

const modules = [Zoom, Navigation];

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
