<template>
    <div class="vdialog-overlay js-vdialog-overlay" v-show="visible">
        <div class="vdialog-overlay__inner-wrap" @click.self="triggerClose">
            <div class="vdialog-overlay__inner" :style="{maxWidth: '1000px'}">
                <div class="u-content_h3 vdialog-overlay__header">
                    <div class="vdialog-overlay__title">
                        <slot name="header">
                            Сводная
                        </slot>
                    </div>

                    <i
                        class="material-icons close-overlay-btn"
                        @click="triggerClose"
                    >clear</i>
                </div>

                <div class="vdialog-overlay__content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            isVisible: {
                type: Boolean,
                default: false,
            },
        },

        data() {
            return {
                visible: this.isVisible,
            }
        },

        methods: {
            open() {
                this.visible = true;
            },

            close() {
                this.$emit('close');
            },

            triggerClose() {
                this.visible = false;
                this.close();
            },
        },

        mounted() {
            document.body.appendChild(this.$el);
        },

        beforeDestroy() {
            this.$el.remove();
        },

        watch: {
            isVisible(value) {
                if (value) {
                    this.open();
                } else {
                    this.triggerClose();
                }
            },
        }
    }
</script>

<style lang="less">
    @overlayPadding: 12px;

    .vdialog-overlay {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.55);
        overflow-y: scroll;
        overflow-x: hidden;
        z-index: 9999;
    }

    .vdialog-overlay__inner-wrap {
        min-height: calc(100% - @overlayPadding * 2);
        padding: @overlayPadding 0;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .vdialog-overlay__inner {
        background-color: #000000fc;
        box-sizing: border-box;
        width: calc(100% - 12px);
        height: auto;
        padding: 18px;
        border-radius: 6px;
        cursor: default;
        position: relative;
    }

    .vdialog-overlay__title {
        max-width: calc(100% - 24px);
    }

    .vdialog-overlay__header {
        display: flex;
        align-items: center;
        margin-bottom: 18px !important;
        padding: 0 !important;
        position: relative;
        line-height: 24px;
    }

    .close-overlay-btn {
        cursor: pointer;
        position: absolute;
        right: 0;
        top: 0;

        &.disabled {
            opacity: 0.5;
        }
    }

    .vdialog-overlay__loader-wrap {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.6);
        z-index: 2;
        border-radius: inherit;

        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>