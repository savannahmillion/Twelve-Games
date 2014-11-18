<?php 
	$page_title = "a partridge";
?>
<?php include("includes/head.html");?>

<body>
<div class="page-wrap">

	<?php include("includes/header.html");?>
	<?php include("includes/navigation.html");?>

		<div class="main-content center">
			<h1>a partridge</h1>

			<div class="game" id="game-canvas">

				<script type="text/javascript">

			    window.onload = function(){
			        mainGame();  
			    };

			    </script>

			</div>
		</div>	

	<?php include("includes/footer.html");?>
</div>

</body>

</html>