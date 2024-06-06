<template>
	<nav class="bg-white shadow-md h-16">
		<div
			class="container mx-auto px-4 h-full flex flex-row items-center justify-between"
		>
			<Logo type="long" href="/" class="h-3/5" />
			<ClientOnly>
				<SessionState />
			</ClientOnly>
		</div>
	</nav>
</template>

<script lang="ts" setup></script>
