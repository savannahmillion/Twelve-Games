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
					Goal: repeat the sequence that the hens create for you. (10 times)<br/><br/>

					Desktop: click to start and select a hen.<br/>
					Mobile: tap to start and select a hen.<br/>
				</p>
				<small>Released December 16th, 2014</small>
			</div>
			
		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>