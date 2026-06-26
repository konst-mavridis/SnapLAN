fn main(){
    // let numbers: [i32; 5] = [1,2,3,4,5];
    // println!("Number Array: {:?}", numbers);

    // Arrays
    let fruits: [&str; 3] = ["Apple", "Banana", "Mango"];
    println!("Fruitsss: {:?}", fruits);
    println!("Fruits Array 1st element: {}", fruits[0]);
    println!("Fruits Array 2nd element: {}", fruits[1]);
    println!("Fruits Array 3rd element: {}", fruits[2]);

    // Tuples
    let human: (String, i32, bool) = ("Alice".to_string(), 30, false);
    println!("Human Tuple: {:?}", human);

    let my_mix_tuple = ("Kratos", 23, true, [1,2,3,4,5]);
    println!("My Mix Tuple: {:?}", my_mix_tuple);

    // Slices: [1,2,3,4,5]
    let number_slices:&[i32] = &[1,2,3,4,5];
    println!("Number Slice: {:?}", number_slices);

    let animal_slices:&[&str] = &["Lion", "Tiger", "Elephant"];
    println!("Number Slice: {:?}", animal_slices);

    let book_slices:&[&String] = &[&"IT".to_string(), &"Tiger".to_string(), &"Elephant".to_string()];
    println!("Book Slice: {:?}", book_slices);

    // String vs String Slices
    let mut stone_cold: String = String::from("Hell,");
    stone_cold.push_str("Yeah!");
    println!("Stone Cold Says: {}", stone_cold);

    //B- &str (String Slices)
    
}