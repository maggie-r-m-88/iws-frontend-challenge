<template>
	 <vue-thermometer :value="temp_value" :min="min_value" :max="max_value"/>
</template>
<script>
export default {
	name: 'VueThermometer',
	props: {
		temp_value: '',
		min_value: '',
		max_value: ''
	}
}
</script>