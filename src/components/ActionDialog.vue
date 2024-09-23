<template>
	<q-card class="bg_color_page">
		<q-card-section class="bg-modal-title">
			<div class="row justify-start content-center" style="height:10px">
				<span>{{title ? title : '+ Filtros'}}</span>
				<q-space />
				<q-btn flat v-close-popup round dense icon="close" />
			</div>
		</q-card-section>
		<q-separator />
		<q-card-section class="q-pa-none scroll">
			<slot></slot>
		</q-card-section>
		<q-separator />
		<q-card-actions align="left" class="bg-modal-footer">
			<q-btn flat :label="cancel ? cancel : 'Cancelar'" v-close-popup />
			<q-space />
			<q-btn :label="ok ? ok : 'Aplicar'" flat @click="aplicar" v-if="verOk"/>
		</q-card-actions>
	</q-card>
</template>

<script>
export default {
    name: "action-dialog",
	props:['title', 'cancel', 'ok', 'hide_ok'],
	emits: ['send-fn'],

	data() {
		return {
			verOk: this.hide_ok === undefined ? true : this.hide_ok === 'true' ? false : true
		}
	},

	methods:{
        aplicar(){
			this.$emit('send-fn');
		}
	},
}

</script>

<style scoped>

</style>
