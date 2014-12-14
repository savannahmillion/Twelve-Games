<?php 
	$page_title = "a partridge";
?>
<?php include("includes/head.html");?>

<script src="js/one.js"></script>

<body id="one">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>a partridge</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: Avoid hitting the ornaments and collect all the pears!<br/><br/>

					Desktop: flap with spacebar and move with the arrow keys.<br/>
					Mobile: tap to flap and tilt to move.<br/>
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