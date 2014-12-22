<?php 
	$page_title = "ten lords leaping";
?>
<?php include("includes/head.html");?>

<script src="js/ten.js"></script>

<body id="ten">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>ten lords leaping</h1>

			<div class="game" id="game-canvas">
			</div>

			<div class="about-game" id="about-game">
				<h3>about this game</h3>
				<p>
					Goal: avoid hitting any of the trees by making the ten lords leap!<br/><br/>

					Desktop: click to start and leap.<br/>
					Mobile: tap to start and leap.<br/>	
				</p>
				<small>Released December 23rd, 2014</small>
			</div>

		</div>	

	<?php include("includes/footer.html");?>

	<script type="text/javascript">
		loadGameIfDateIsValid();
	</script>

</body>

</html>