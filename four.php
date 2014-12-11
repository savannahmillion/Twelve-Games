<?php 
	$page_title = "four calling birds";
?>
<?php include("includes/head.html");?>

<script src="js/four.js"></script>

<body id="three">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center page-wrap">
			<h1>four calling birds</h1>

			<div class="game" id="game-canvas">
				<script type="text/javascript">
					loadGameIfDateIsValid();
				</script>
			</div>
		</div>	

	<?php include("includes/footer.html");?>

</body>

</html>