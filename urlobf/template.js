window.template = 
`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BadAimWeeb's (Anti-ZUCC?) Link/Source Sharing System</title>
</head>

<body>
    <script>
        function swapCase(e) {
            return e.split('').map(function (c) {
                return c === c.toUpperCase()
                    ? c.toLowerCase()
                    : c.toUpperCase()
            }).join('');
        }

        setTimeout(function () {
            location.href = decodeURIComponent(atob(swapCase("__WHAT_THE_FUCK__")));
        }, Math.round(Math.random() * 495) + 5);
    </script>
</body>

</html>`