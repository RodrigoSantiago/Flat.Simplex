package com.flat.simplex.builder;

public class ProjectBuilder {

    public void addGameObject(GameObject gameObject) {

    }

    public void addConstant(Constant constant) {
        // compile only [change values]
    }

    public void addScript(Script script) {
        //
    }

    public void load() {
        // read all and show the erros
    }

    public void build(ProjectWriter writter) {
        // script : create a static method on a ScriptClass
        // gameobject : create a Class and assign to FactoryClass id+pathname -- create a class (.js or .h/.cpp)
        // assign hashnames to HashNameClass (cpp only)
    }
}
