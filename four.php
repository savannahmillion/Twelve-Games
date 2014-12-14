<?php 
	$page_title = "four calling birds";
?>
<?php include("includes/head.html");?>

<script src="js/four.js"></script>

<body id="four">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>four calling birds</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: make all of the birds talk about the same thing!<br/><br/>

					Desktop: click to start and select the item in the highlighted bubble.<br/>
					Mobile: tap to start and select the item in the highlighted bubble.<br/>
				</p>
				<small>Released December 17th, 2014</small>
			</div>
			
		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>