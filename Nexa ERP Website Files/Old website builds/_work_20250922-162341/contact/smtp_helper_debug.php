<?php
function nexa_smtp_send_debug($host,$port,$secure,$username,$password,$from,$to,$subject,$body,$fromName='Nexa Website'){
  $log=["host"=>$host,"port"=>$port,"secure"=>$secure,"ts"=>date('c'),"to"=>$to,"subject"=>$subject];
  $file=__DIR__."/../logs/mail-debug-".date('Ymd-His')."-".bin2hex(random_bytes(3)).".json";
  $remote=($secure==='ssl'?'ssl://'.$host:$host);
  $fp=@fsockopen($remote,$port,$errno,$errstr,15);
  $log["connect"]=["ok"=>(bool)$fp,"errno"=>$errno,"errstr"=>$errstr];
  if(!$fp){file_put_contents($file,json_encode($log,JSON_PRETTY_PRINT));return[false,$file];}
  $read=function()use($fp){return fgets($fp,515);};
  $write=function($c)use($fp){fputs($fp,$c."\r\n");};
  $expect=function($code)use($read,&$log){$line='';while($l=$read()){$line.=$l;if(preg_match('/^\\d{3}\\s/',$l))break;}$log["last_reply"]=$line;return substr($line,0,3)==strval($code);};
  $read();$write("EHLO nexaai.co.uk");if(!$expect(250)){file_put_contents($file,json_encode($log));return[false,$file];}
  if($secure==='tls'){$write("STARTTLS");if(!$expect(220)){file_put_contents($file,json_encode($log));return[false,$file];}
    stream_socket_enable_crypto($fp,true,STREAM_CRYPTO_METHOD_TLS_CLIENT);
    $write("EHLO nexaai.co.uk");if(!$expect(250)){file_put_contents($file,json_encode($log));return[false,$file];}}
  $write("AUTH LOGIN");if(!$expect(334)){file_put_contents($file,json_encode($log));return[false,$file];}
  $write(base64_encode($username));if(!$expect(334)){file_put_contents($file,json_encode($log));return[false,$file];}
  $write(base64_encode($password));if(!$expect(235)){file_put_contents($file,json_encode($log));return[false,$file];}
  $write("MAIL FROM:<$from>");if(!$expect(250)){file_put_contents($file,json_encode($log));return[false,$file];}
  $write("RCPT TO:<$to>");if(!$expect(250)){file_put_contents($file,json_encode($log));return[false,$file];}
  $write("DATA");if(!$expect(354)){file_put_contents($file,json_encode($log));return[false,$file];}
  $headers="From: $fromName <$from>\r\nReply-To: $fromName <$from>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
  fputs($fp,$headers."Subject: $subject\r\n\r\n$body\r\n.\r\n");
  $write(".");if(!$expect(250)){file_put_contents($file,json_encode($log));return[false,$file];}
  $write("QUIT");fclose($fp);$log["done"]=true;file_put_contents($file,json_encode($log,JSON_PRETTY_PRINT));return[true,$file];
}
?>
