<script>
    import { navigate } from "svelte-routing";
    import GridItem from "../components/grid_item.svelte";

    function nav() {
        navigate("/scheduler", { replace: true });
    }
</script>

<heading>
    <h1>Welcome to Hyper-Schedule</h1>
    <p>Give your students the best schedules so they can have the best year.</p>
</heading>
<grid>
    <GridItem
        img="img/cohort.png"
        title="Cohorts"
        description="Re-opening during COVID-19 is a tough process. One strategy to help slow the spread is to separate students and teachers into isolated cohorts. This way if a student gets sick, the spread can be limited without having to shut down the whole school. We can automatically sort students and teachers into isolated cohorts."
    />
    <GridItem
        img="img/graph.png"
        title="Optimization"
        description="We start with a centralized genetic algorithm. We create several generations with thousands of options in order to get our initial setup. Once we arrive at sufficiently optimized schedules, we use several other optimization functions to create the best schedules possible."
    />
    <GridItem
        img="img/imports.png"
        title="Easy Imports/Exports"
        description="Import and export with Excel, JSON or CSVs."
    />
</grid>
<center>
    <button on:click={nav}> Get Started </button>
</center>

<style lang="sass">
    h1 
        text-align: center
        font-size: 42px
        padding: 0px 25px
        margin-top: 50px
        margin-bottom: 0px
    p 
        text-align: center
        font-size: 20px
    
    center
        display: flex
        justify-content: center
    button
        text-align: center
        font-size: 20px
        padding: 20px
        margin: 10px
        display: flex
        justify-content: center
        outline: none
        border: none
        transition: 300ms ease

        &:hover
            background-color: #C0C0C0
    


    grid
        display: grid
        text-align: center
        @media (max-width: 800px) 
            grid-template-columns: repeat(1, 3fr)
        @media (max-width: 1200px) and (min-width: 801px)
            grid-template-columns: repeat(2, 3fr)
        @media (min-width: 1201px)
            grid-template-columns: repeat(3, 3fr)   
        grid-template-rows: auto
        justify-items: center
</style>
