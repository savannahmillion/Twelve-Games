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
				<script type="text/javascript">
					loadGameIfDateIsValid();
				</script>
			</div>
		</div>	

	<?php include("includes/footer.html");?>

</body>

</html>