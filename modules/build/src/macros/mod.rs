#[macro_export]
macro_rules! ok {
    ( $x:expr ) => {
        $x.unwrap()
    };
}

#[macro_export]
macro_rules! join {
    ( $( $x:expr ),+ $( , )?)  => {
        {
            let mut p = $crate::PathBuf::new();
            $( p.push($x); )*
            p
        }
    };
}

#[macro_export]
macro_rules! string {
    ( $x:expr ) => {
        ok!($x.to_str()).to_string()
    };
}

#[macro_export]
macro_rules! own {
    ( $x:expr ) => {
        $x.to_owned()
    };
}

#[macro_export]
macro_rules! path {
    ( $x:expr ) => {
        $crate::PathBuf::from($x)
    };
}

#[macro_export]
macro_rules! fref {
    ( $x:expr ) => {
        ok!($x.create_ref())
    };
}

#[macro_export]
macro_rules! fun {
    ( $x:expr, $y:expr ) => {
        ok!($crate::FunctionRef::borrow_back(&$x, &$y))
    };
}

#[macro_export]
macro_rules! throw {
    ( $x:expr ) => {
        return Err(napi::Error::new(napi::Status::Unknown, format!("{}", $x)))
    };
}

#[macro_export]
macro_rules! throw_error {
    ( $x:tt, $y:expr ) => {
        return Err(Error::new(napi::Status::$x, format!("{}", $y)));
    };
}

#[macro_export]
macro_rules! ext {
    ( $x:expr ) => {
        if let Some(path) = path!($x).extension() {
            ok!(path.to_str())
        } else {
            ""
        }
    };
}
