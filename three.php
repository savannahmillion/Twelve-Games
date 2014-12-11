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
				<script type="text/javascript">
					loadGameIfDateIsValid();
				</script>
			</div>
		</div>	

	<?php include("includes/footer.html");?>

</body>

</html>