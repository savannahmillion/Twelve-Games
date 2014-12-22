<?php 
	$page_title = "nine ladies dancing";
?>
<?php include("includes/head.html");?>

<script src="js/nine.js"></script>

<body id="nine">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>nine ladies dancing</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: select the ladies who want to dance before their timer runs out! (blue circle disappears)<br/><br/>

					Desktop: click to start and select.<br/>
					Mobile: tap to start and select.<br/>	
				</p>
				<small>Released December 22nd, 2014</small>
			</div>

		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>