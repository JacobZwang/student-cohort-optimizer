<script lang="typescript">
	import { Router, Link, Route } from "svelte-routing";
import ImportData from "./pages/import_data.svelte";
	import Intro from "./pages/intro.svelte";
	let url = window.location.pathname;
</script>
<Router {url}>
	<nav>
	  
		<Route path="/"><Intro /></Route>
		<Route path="/scheduler"><ImportData/></Route>
</Router>

<style>
</style>
