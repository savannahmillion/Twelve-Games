<?php 
	$page_title = "three french hens";
?>
<?php include("includes/head.html");?>

<script src="js/three.js"></script>

<body id="three">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>three french hens</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					In A Partridge, use the spacebar and arrow keys to grab pears. Try to avoid breaking the ornaments. A Partridge also works on mobile. Steer the bird by tilting your phone, and tap to fly up.<br/>
				</p>
				<small>Released December 14th, 2014</small>
			</div>
			
		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>