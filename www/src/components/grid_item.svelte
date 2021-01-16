<script>
    export let title: string;
    export let description: string;
    export let img: string;
</script>
<style lang="sass">
   
    card
        display: block
        width: 360px
        margin: 20px
    img
        width: inherit
</style>
<card>
<h2>{title}</h2>
<p>{description}</p>
<img src={img} alt="Function"/>
</card>